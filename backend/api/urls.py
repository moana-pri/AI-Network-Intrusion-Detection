
from django.urls import path

from . import views


urlpatterns = [
    path("traffic/", views.traffic_list),
    path("alerts/", views.alert_list),
    path("dashboard/stats/", views.dashboard_stats),
]