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
    event_id = models.ForeignKey(Event,on_delete=models.CASCADE)
    excluded = models.JSONField(default=list)

    def __self__(self):
        return self.event_id.id
    
class Match(models.Model):
    event_id = models.ForeignKey(Event,on_delete=models.CASCADE,null=True)
    fight_number = models.IntegerField()
    entry_name = models.CharField(max_length=100)
    owner_name = models.CharField(max_length=100)
    chicken_name = models.CharField(max_length=100)
    weight = models.FloatField(null=True)
    # Matched opponent fields
    matched_entry_name = models.CharField(max_length=100)
    matched_owner_name = models.CharField(max_length=100)
    matched_chicken_name = models.CharField(max_length=100)
    matched_weight = models.FloatField(null=True)

    def __str__(self):
        return f"{self.entry_name}-{self.matched_entry_name}"

