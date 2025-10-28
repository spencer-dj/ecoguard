
import pandas as pd
from django.core.management.base import BaseCommand
from ...models import AnimalMovement  # Update with your app name

class Command(BaseCommand):
    help = 'Imports animal movement data from CSV'
    
    def handle(self, *args, **options):
        df = pd.read_csv('C:/Users/HP\Documents/EcoGuard Trials/movement data/final_dep.csv')
        #drop the unnamed column
        df.drop(columns='Unnamed: 0', inplace=True)
        # Convert datetime
        #df['datetime'] = pd.to_datetime(df['datetime'])
        
        # Batch import
        batch_size = 500
        objs = []
        
        for _, row in df.iterrows():
            objs.append(AnimalMovement(**row.to_dict()))
            
            if len(objs) >= batch_size:
                AnimalMovement.objects.bulk_create(objs)
                objs = []
        
        if objs:
            AnimalMovement.objects.bulk_create(objs)
        
        self.stdout.write(self.style.SUCCESS(f'Imported {len(df)} records'))