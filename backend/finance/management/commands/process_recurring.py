from django.core.management.base import BaseCommand
from django.utils import timezone
from finance.models import RecurringTransaction, Transaction
from decimal import Decimal

class Command(BaseCommand):
    help = "Process due recurring transactions and create Transaction entries."

    def handle(self, *args, **options):
        today = timezone.localdate()
        due = RecurringTransaction.objects.filter(active=True).filter(next_date__lte=today)
        created_count = 0
        for r in due:
            # create transactions for each missed occurrence up to today
            while r.next_date <= today and (r.end_date is None or r.next_date <= r.end_date):
                Transaction.objects.create(
                    user=r.user,
                    account=r.account,
                    category=r.category,
                    amount=r.amount,
                    date=r.next_date,
                    notes=f"Recurring: {r.pk}",
                )
                created_count += 1
                r.advance_next_date()
        self.stdout.write(self.style.SUCCESS(f"Created {created_count} transactions."))
