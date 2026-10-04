import csv
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.models import Alert


csv_file = "../alerts.csv"

with open(csv_file, "r", newline="") as file:
    reader = csv.DictReader(file)

    imported = 0
    skipped = 0

    for row in reader:

        if not row["Source IP"] or not row["Protocol"]:
            skipped += 1
            continue

        Alert.objects.create(
            alert_type=row["Alert Type"],
            source_ip=row["Source IP"],
            protocol=row["Protocol"],
            severity=row["Severity"],
            detection_method=row["Detection Method"]
        )

        imported += 1

print("Alert data imported successfully!")
print("Imported:", imported)
print("Skipped:", skipped)