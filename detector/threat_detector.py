from scapy.all import sniff, IP, TCP, UDP
from collections import defaultdict
from feature_extractor import extract_features


# Store destination ports contacted by each source IP
port_activity = defaultdict(set)


def detect_port_scan(features):

    source_ip = features["source_ip"]
    destination_port = features["destination_port"]

    if source_ip is None or destination_port is None:
        return False

    port_activity[source_ip].add(destination_port)

    # Simple rule:
    # If one IP contacts 10 or more different ports,
    # consider it suspicious.
    if len(port_activity[source_ip]) >= 10:
        return True

    return False


print("Starting Network Intrusion Detection...")
print("Capturing packets...\n")

packets = sniff(count=50)

for packet in packets:

    features = extract_features(packet)

    if detect_port_scan(features):

        print("🚨 POSSIBLE PORT SCAN DETECTED")
        print("Source IP:", features["source_ip"])
        print("Ports contacted:", port_activity[features["source_ip"]])

    else:

        print(
            "Normal:",
            features["source_ip"],
            "->",
            features["destination_ip"],
            "|",
            features["protocol"]
        )