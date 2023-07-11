from rest_framework import serializers
from .models import Operation_hoopers, Operations, Parking_lot, Payment_machine
    
# parking table serializer
class Parking_lotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parking_lot
        fields = '__all__'

# payment machine table serializer
class Payment_machineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment_machine
        fields = '__all__'

# operations table
class OperationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operations
        fields = '__all__' 

# operation_hoopers table
class Operations_hoopersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operation_hoopers
        fields = '__all__'
 