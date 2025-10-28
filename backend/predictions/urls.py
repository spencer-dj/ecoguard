from django.urls import path
from .views import (receive_prediction, map_view_data, 
                    get_xgb_results, get_image_results,
                    validate_poacher, get_poaching_history, admin_notifications, ranger_notifications)

urlpatterns = [
    path('api/receive-prediction/', receive_prediction),
    path('mapview/', map_view_data, name='mapview'),
    path('xgb-results/', get_xgb_results),
    path('image-results/', get_image_results),
    path('validate-poacher/', validate_poacher),
    path('history/', get_poaching_history),
    path('admin-notification/', admin_notifications),
    path('ranger-notification/', ranger_notifications)

]
