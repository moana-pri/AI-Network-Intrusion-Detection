from scapy.all import sniff, IP, TCP, UDP, ICMP, ARP


def extract_features(packet):

    features = {
        "source_ip": None,
        "destination_ip": None,
        "protocol": None,
        "source_port": None,
        "destination_port": None,
        "packet_size": len(packet),
        "tcp_flags": None
    }

    # IP information
    if IP in packet:
        features["source_ip"] = packet[IP].src
        features["destination_ip"] = packet[IP].dst

    # TCP
    if TCP in packet:
        features["protocol"] = "TCP"
        features["source_port"] = packet[TCP].sport
        features["destination_port"] = packet[TCP].dport
        features["tcp_flags"] = str(packet[TCP].flags)

    # UDP
    elif UDP in packet:
        features["protocol"] = "UDP"
        features["source_port"] = packet[UDP].sport
        features["destination_port"] = packet[UDP].dport

    # ICMP
    elif ICMP in packet:
        features["protocol"] = "ICMP"

    # ARP
    elif ARP in packet:
        features["protocol"] = "ARP"
        features["source_ip"] = packet[ARP].psrc
        features["destination_ip"] = packet[ARP].pdst

    return features


print("Capturing 10 packets...\n")

packets = sniff(count=10)

for packet in packets:

    features = extract_features(packet)

    print("--------------------------------")
    print("Source IP       :", features["source_ip"])
    print("Destination IP  :", features["destination_ip"])
    print("Protocol        :", features["protocol"])
    print("Source Port     :", features["source_port"])
    print("Destination Port:", features["destination_port"])
    print("Packet Size     :", features["packet_size"])
    print("TCP Flags       :", features["tcp_flags"])