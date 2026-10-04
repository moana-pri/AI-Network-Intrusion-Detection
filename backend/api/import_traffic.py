import csv
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.models import Traffic


csv_file = "../traffic_data.csv"

with open(csv_file, "r", newline="") as file:
    reader = csv.DictReader(file)

    imported = 0
    skipped = 0

    for row in reader:

        # Skip rows with missing required values
        if not row["Source IP"] or not row["Destination IP"] or not row["Protocol"]:
            skipped += 1
            continue

        Traffic.objects.create(
            source_ip=row["Source IP"],
            destination_ip=row["Destination IP"],
            protocol=row["Protocol"],
            source_port=int(row["Source Port"]) if row["Source Port"] else None,
            destination_port=int(row["Destination Port"]) if row["Destination Port"] else None,
            packet_size=int(row["Packet Size"]) if row["Packet Size"] else None,
            tcp_flags=row["TCP Flags"] or ""
        )

        imported += 1

print("Traffic data imported successfully!")
print("Imported:", imported)
print("Skipped:", skipped)