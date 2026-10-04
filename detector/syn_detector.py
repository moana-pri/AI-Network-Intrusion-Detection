from scapy.all import sniff, IP, TCP
from collections import defaultdict


syn_activity = defaultdict(int)


def detect_syn_activity(packet):

    if IP not in packet or TCP not in packet:
        return False

    flags = str(packet[TCP].flags)

    # Check whether SYN is set
    if "S" in flags and "A" not in flags:
        source_ip = packet[IP].src

        syn_activity[source_ip] += 1

        if syn_activity[source_ip] >= 20:
            return True

    return False


print("Starting SYN Detection...")
print("Capturing 100 packets...\n")

packets = sniff(count=100)

for packet in packets:

    if detect_syn_activity(packet):

        source_ip = packet[IP].src

        print("🚨 POSSIBLE SYN FLOOD DETECTED")
        print("Source IP:", source_ip)
        print("SYN packets:", syn_activity[source_ip])

    elif IP in packet and TCP in packet:

        flags = str(packet[TCP].flags)

        if "S" in flags and "A" not in flags:

            source_ip = packet[IP].src

            print(
                "SYN packet:",
                source_ip,
                "->",
                packet[IP].dst,
                "| Count:",
                syn_activity[source_ip]
            )