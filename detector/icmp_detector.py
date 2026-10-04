from scapy.all import sniff, IP, ICMP
from collections import defaultdict


# Store ICMP packet count for each source IP
icmp_activity = defaultdict(int)


def detect_icmp_flood(packet):

    if ICMP not in packet:
        return False

    if IP not in packet:
        return False

    source_ip = packet[IP].src

    icmp_activity[source_ip] += 1

    # Demonstration threshold
    if icmp_activity[source_ip] >= 20:
        return True

    return False


print("Starting ICMP Flood Detection...")
print("Capturing 100 packets...\n")

packets = sniff(count=100)

for packet in packets:

    if detect_icmp_flood(packet):

        source_ip = packet[IP].src

        print("🚨 POSSIBLE ICMP FLOOD DETECTED")
        print("Source IP:", source_ip)
        print("ICMP packets:", icmp_activity[source_ip])

    elif ICMP in packet:

        source_ip = packet[IP].src

        print(
            "ICMP packet:",
            source_ip,
            "->",
            packet[IP].dst,
            "| Count:",
            icmp_activity[source_ip]
        )