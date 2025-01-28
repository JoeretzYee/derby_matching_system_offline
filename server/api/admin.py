from django.contrib import admin
from .models import Event,Entries,ToprankEntries,ExcludedEntries

# Register your models here.
admin.site.register(Event)
admin.site.register(Entries)
admin.site.register(ToprankEntries)
admin.site.register(ExcludedEntries)