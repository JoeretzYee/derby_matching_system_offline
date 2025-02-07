from .models import Event,Entries,ToprankEntries,ExcludedEntries,Match
from rest_framework import serializers

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class EntriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entries
        fields = '__all__'


class ToprankSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToprankEntries
        fields = '__all__'


class ExcludedEntriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExcludedEntries
        fields = '__all__'


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'
        