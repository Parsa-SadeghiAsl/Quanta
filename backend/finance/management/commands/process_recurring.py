from django.core.management.base import BaseCommand
from django.utils import timezone
from finance.models import RecurringTransaction, Transaction
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Processes all due recurring transactions and creates standard Transaction objects.'

    def handle(self, *args, **options):
        today = timezone.localdate()
        # Get all recurring items that are due to be processed
        due_items = RecurringTransaction.objects.filter(next_date__lte=today)
        
        created_count = 0
        for item in due_items:
            # Check if the recurring transaction has expired
            if item.next_date and item.next_date > item.next_date:
                continue

            # Create a new standard transaction
            Transaction.objects.create(
                user=item.user,
                account=item.account,
                category=item.category,
                amount=item.amount,
                date=item.next_date,
                notes=f"Recurring: {item.notes or 'Monthly'}"
            )
            created_count += 1
            
            # Advance the 'next_date' for the next cycle
            item.advance_next_date()
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} recurring transactions.'))
