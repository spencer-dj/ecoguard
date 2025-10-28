from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('base.urls')),
    path('', include('predictions.urls')),
    path('', lambda request: HttpResponseRedirect('/admin/login/?next=/admin/')),
    path('api/', include('predictions.urls'))
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)