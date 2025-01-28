from django.db import models

class Event(models.Model):
    name = models.CharField(max_length=255)
    when = models.DateTimeField()
    givenTake = models.IntegerField()

    def __str__(self):
        return self.name
    
class Entries(models.Model):
    entry_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    address    = models.CharField(max_length=255)
    is_toprank = models.BooleanField(default=False)
    chicken_entries = models.JSONField(default=list)
    event_id   = models.ForeignKey(Event,on_delete=models.CASCADE)


    def __str__(self):
        return self.entry_name
    
class ToprankEntries(models.Model):
    entry_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    address    = models.CharField(max_length=255)
    is_toprank = models.BooleanField(default=True)
    chicken_entries = models.JSONField(default=list)
    event_id   = models.ForeignKey(Event,on_delete=models.CASCADE)


    def __str__(self):
        return self.entry_name
    
class ExcludedEntries(models.Model):
    event_id = models.ForeignKey(Event, on_delete=models.CASCADE)
    excluded = models.JSONField(default=list)

    def __str__(self):
        if len(self.excluded) >= 1 and isinstance(self.excluded[0], dict):
            entry1 = self.excluded[0].get('entry1', 'N/A')
            entry2 = self.excluded[0].get('entry2', 'N/A')
            return f"Excluded Entries: {entry1} - {entry2}"
        return "Excluded Entries: Insufficient or invalid data"



