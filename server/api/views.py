from rest_framework import viewsets
from rest_framework.response import Response
from .models import Event,Entries,ToprankEntries,ExcludedEntries,Match
from .serializers import EventSerializer,EntriesSerializer,ToprankSerializer,ExcludedEntriesSerializer,MatchSerializer
from rest_framework.decorators import action 
from rest_framework import status


class EventViewSet(viewsets.ViewSet):
    # list of all events
    def list(self,request):
        events = Event.objects.all()
        serializer = EventSerializer(events,many=True)
        return Response(serializer.data)
    
    # Get single event
    def retrieve(self,request,pk=None):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail":"Not found"},status=404)
        
        serializer = EventSerializer(event)
        return Response(serializer.data)
    

    # Create Event
    def create(self,request,pk=None):
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=201)
        return Response(serializer.errors,status=400)
    
    # update event
    def update(self,request,pk=None):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail":"Not found"},status=404)
        
        serializer = EventSerializer(event,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)
    
    # delete event
    def destroy(self,request,pk=None):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail":"Not found"},status=404)
        
        event.delete()
        return Response({"detail":"Deleted successfully"},status=204)
    
class EntriesViewSet(viewsets.ViewSet):
    # List all entries or filter by event_id
    def list(self, request):
        event_id = request.query_params.get('event_id')  # Get 'event_id' from query params

        if event_id:
            try:
                entries = Entries.objects.filter(event_id=event_id)  # Filter by event_id
            except ValueError:
                return Response({"detail": "Invalid event_id format."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            entries = Entries.objects.all()  # Return all entries if no event_id is provided

        serializer = EntriesSerializer(entries, many=True)
        return Response(serializer.data)

    # Retrieve a single entry
    def retrieve(self, request, pk=None):
        try:
            entry = Entries.objects.get(pk=pk)
        except Entries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = EntriesSerializer(entry)
        return Response(serializer.data)

    # Create an entry
    def create(self, request):
        serializer = EntriesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    # Update an entry
    def update(self, request, pk=None):
        try:
            entry = Entries.objects.get(pk=pk)
        except Entries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = EntriesSerializer(entry, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Delete an entry
    def destroy(self, request, pk=None):
        try:
            entry = Entries.objects.get(pk=pk)
        except Entries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        entry.delete()
        return Response({"detail": "Deleted successfully"}, status=204)
    
    def categorize_chickens(self, entries):
        stags = []
        bullstags = []
        cocks = []

        for entry in entries:
            for chicken in entry.get("chickenEntries", []):
                if chicken["type"] == "stag":
                    stags.append({**entry, "chickenEntries": [chicken]})
                elif chicken["type"] == "bullstag":
                    bullstags.append({**entry, "chickenEntries": [chicken]})
                elif chicken["type"] == "cock":
                    cocks.append({**entry, "chickenEntries": [chicken]})

        return {"stags": stags, "bullstags": bullstags, "cocks": cocks}

    @action(detail=False, methods=["get"])
    def categorized(self, request):
        event_id = request.query_params.get("event_id")

        if not event_id:
            return Response(
                {"detail": "event_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            entries = Entries.objects.filter(event_id=event_id)
            serializer = EntriesSerializer(entries, many=True)
            categorized_entries = self.categorize_chickens(serializer.data)

            toprank_entries = ToprankEntries.objects.filter(event_id=event_id)
            toprank_serializer = ToprankSerializer(toprank_entries, many=True)
            categorized_toprank_entries = self.categorize_chickens(toprank_serializer.data)

            return Response({
                "entries": categorized_entries,
                "toprankEntries": categorized_toprank_entries
            })
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ToprankViewSet(viewsets.ViewSet):
    # List all entries or filter by event_id
    def list(self, request):
        event_id = request.query_params.get('event_id')  # Get 'event_id' from query params

        if event_id:
            try:
                entries = ToprankEntries.objects.filter(event_id=event_id)  # Filter by event_id
            except ValueError:
                return Response({"detail": "Invalid event_id format."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            entries = ToprankEntries.objects.all()  # Return all entries if no event_id is provided

        serializer = ToprankSerializer(entries, many=True)
        return Response(serializer.data)

    # Retrieve a single toprank entry
    def retrieve(self, request, pk=None):
        try:
            entry = ToprankEntries.objects.get(pk=pk)
        except ToprankEntries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = ToprankSerializer(entry)
        return Response(serializer.data)

    # Create a toprank entry
    def create(self, request):
        serializer = ToprankSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    # Update a toprank entry
    def update(self, request, pk=None):
        try:
            entry = ToprankEntries.objects.get(pk=pk)
        except ToprankEntries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = ToprankSerializer(entry, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Delete a toprank entry
    def destroy(self, request, pk=None):
        try:
            entry = ToprankEntries.objects.get(pk=pk)
        except ToprankEntries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        entry.delete()
        return Response({"detail": "Deleted successfully"}, status=204)
    

class ExcludedEntriesViewSet(viewsets.ViewSet):
    # List all entries or filter by event_id
    def list(self, request):
        event_id = request.query_params.get('event_id')  # Get 'event_id' from query params

        if event_id:
            try:
                entries = ExcludedEntries.objects.filter(event_id=event_id)  # Filter by event_id
            except ValueError:
                return Response({"detail": "Invalid event_id format."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            entries = ExcludedEntries.objects.all()  # Return all entries if no event_id is provided

        serializer = ExcludedEntriesSerializer(entries, many=True)
        return Response(serializer.data)

    # Retrieve a single exluded entry
    def retrieve(self, request, pk=None):
        try:
            entry = ExcludedEntries.objects.get(pk=pk)
        except ExcludedEntries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = ExcludedEntriesSerializer(entry)
        return Response(serializer.data)

    # Create a toprank entry
    def create(self, request):
        serializer = ExcludedEntriesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    # Update a toprank entry
    def update(self, request, pk=None):
        try:
            entry = ExcludedEntries.objects.get(pk=pk)
        except ExcludedEntries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = ExcludedEntriesSerializer(entry, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # Delete a toprank entry
    def destroy(self, request, pk=None):
        try:
            entry = ExcludedEntries.objects.get(pk=pk)
        except ExcludedEntries.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        entry.delete()
        return Response({"detail": "Deleted successfully"}, status=204)
    

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer