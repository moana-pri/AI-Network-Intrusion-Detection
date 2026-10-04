from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Traffic, Alert


@api_view(['GET'])
def traffic_list(request):
    traffic = Traffic.objects.all().order_by('-timestamp')

    data = []

    for item in traffic:
        data.append({
            "id": item.id,
            "source_ip": item.source_ip,
            "destination_ip": item.destination_ip,
            "protocol": item.protocol,
            "source_port": item.source_port,
            "destination_port": item.destination_port,
            "packet_size": item.packet_size,
            "tcp_flags": item.tcp_flags,
            "timestamp": item.timestamp,
        })

    return Response(data)


@api_view(['GET'])
def alert_list(request):
    alerts = Alert.objects.all().order_by('-timestamp')

    data = []

    for alert in alerts:
        data.append({
            "id": alert.id,
            "alert_type": alert.alert_type,
            "source_ip": alert.source_ip,
            "protocol": alert.protocol,
            "severity": alert.severity,
            "detection_method": alert.detection_method,
            "timestamp": alert.timestamp,
        })

    return Response(data)


@api_view(['GET'])
def dashboard_stats(request):
    return Response({
        "total_traffic": Traffic.objects.count(),
        "total_alerts": Alert.objects.count(),
        "high_alerts": Alert.objects.filter(severity="HIGH").count(),
        "medium_alerts": Alert.objects.filter(severity="MEDIUM").count(),
    })