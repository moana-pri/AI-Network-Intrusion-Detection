import csv
import os

LOG_FILE = "traffic_data.csv"


def save_traffic(features):

    file_exists = os.path.exists(LOG_FILE)

    with open(LOG_FILE, "a", newline="") as file:

        writer = csv.writer(file)

        if not file_exists:
            writer.writerow([
                "Source IP",
                "Destination IP",
                "Protocol",
                "Source Port",
                "Destination Port",
                "Packet Size",
                "TCP Flags"
            ])

        writer.writerow([
            features["source_ip"],
            features["destination_ip"],
            features["protocol"],
            features["source_port"],
            features["destination_port"],
            features["packet_size"],
            features["tcp_flags"]
        ])