# backend/finance/signals.py
from decimal import Decimal
from django.db.models import F
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from .models import Transaction, Account

def _transaction_effect(tx):
    """
    Returns Decimal effect to apply to the account.balance:
    - positive => add to balance
    - negative => subtract from balance
    Logic:
      - if tx.category is present: category.type determines sign
      - else: use amount sign (negative => expense)
    """
    amt = tx.amount or Decimal("0.00")
    if tx.category is not None:
        if getattr(tx.category, "type", "") == "expense":
            return -amt
        else:
            return amt
    # fallback: amount sign
    return amt

@receiver(pre_save, sender=Transaction)
def finance_transaction_pre_save(sender, instance, **kwargs):
    """
    Save the previous state so post_save can compute diffs.
    Attach as _old_instance attribute on instance.
    """
    if not instance.pk:
        instance._old_instance = None
        return
    try:
        instance._old_instance = sender.objects.select_related("account", "category").get(pk=instance.pk)
    except sender.DoesNotExist:
        instance._old_instance = None

@receiver(post_save, sender=Transaction)
def finance_transaction_post_save(sender, instance, created, **kwargs):
    """
    Apply balance changes on create/update.
    Uses atomic F-expression updates to avoid races.
    """
    # compute new effect
    new_effect = _transaction_effect(instance)

    if created:
        # apply new effect to the instance.account
        Account.objects.filter(pk=instance.account.pk).update(balance=F("balance") + new_effect)
        return

    old = getattr(instance, "_old_instance", None)
    if old is None:
        # fallback: recompute by reversing all transactions for account (rare)
        Account.objects.filter(pk=instance.account.pk).update(balance=F("balance") + new_effect)
        return

    old_effect = _transaction_effect(old)

    # if account changed, revert old_effect on old.account and apply new_effect on new account
    old_account_pk = old.account.pk
    new_account_pk = instance.account.pk

    if old_account_pk == new_account_pk:
        diff = new_effect - old_effect
        if diff != Decimal("0.00"):
            Account.objects.filter(pk=new_account_pk).update(balance=F("balance") + diff)
    else:
        # revert on old account
        Account.objects.filter(pk=old_account_pk).update(balance=F("balance") - old_effect)
        # apply on new account
        Account.objects.filter(pk=new_account_pk).update(balance=F("balance") + new_effect)

@receiver(post_delete, sender=Transaction)
def finance_transaction_post_delete(sender, instance, **kwargs):
    """
    Revert the transaction effect on account when a transaction is deleted.
    """
    effect = _transaction_effect(instance)
    # revert = subtract effect
    Account.objects.filter(pk=instance.account.pk).update(balance=F("balance") - effect)
