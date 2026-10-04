import csv
import os

LOG_FILE = "alerts.csv"


def save_alert(alert):

    file_exists = os.path.exists(LOG_FILE)

    with open(LOG_FILE, "a", newline="") as file:

        writer = csv.writer(file)

        if not file_exists:
            writer.writerow([
                "Timestamp",
                "Alert Type",
                "Source IP",
                "Protocol",
                "Severity",
                "Detection Method"
            ])

        writer.writerow([
            alert["timestamp"],
            alert["type"],
            alert["source_ip"],
            alert["protocol"],
            alert["severity"],
            alert["detection"]
        ])