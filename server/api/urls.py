from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet,EntriesViewSet,ToprankViewSet,ExcludedEntriesViewSet,MatchViewSet

router = DefaultRouter()
router.register('events',EventViewSet,basename='event')
router.register('entries',EntriesViewSet,basename='entries')
router.register('topranks',ToprankViewSet,basename='toprank')
router.register('excluded',ExcludedEntriesViewSet,basename='excluded')
router.register('matches',MatchViewSet,basename='matches')

urlpatterns = [
    path('',include(router.urls)),
]