from django.db import models
from django.contrib.auth.models import  User

# table of the parking lot due to the client number (when we want to display the client his parkings lot)
class Parking_lot(models.Model):
    parking_lot_id = models.CharField(max_length=30, blank=False, primary_key=False)
    parking_lot_name = models.CharField(max_length=30, blank=False)
    username = models.ForeignKey(User, on_delete=models.PROTECT, blank=False)

    def __str__(self):
        return self.parking_lot_id

# table of the machines , when we display the parking lot we can display also the machines
class Payment_machine(models.Model):
    machine_id = models.CharField(max_length=30, blank=False, primary_key=False)
    display_name = models.CharField(max_length=30, blank=False)
    parking_lot = models.ForeignKey(Parking_lot, on_delete=models.PROTECT, max_length=30, blank=False)
    token = models.CharField(max_length=250, blank=False)

    def __str__(self):
        return self.display_name

    
# the specific Token to each machine (i get the reports data from machine and due the token i know to save the data , and know which machine id it is  )
# class Token_machine(models.Model):
#     Token = models.CharField(max_length=30, blank=False, primary_key=False)
#     machine = models.ForeignKey(Payment_machine, on_delete=models.PROTECT, max_length=30, blank=False)

#     def __str__(self):
#         return self.machine.display_name

class CompositeKey(models.Field):
    def __init__(self, *args, **kwargs):
        kwargs['max_length'] = 60
        super().__init__(*args, **kwargs)

    def db_type(self, connection):
        return 'varchar(60)'
    
class Operations(models.Model):
    machine = models.ForeignKey(Payment_machine, on_delete=models.PROTECT)
    operation_id = models.IntegerField(blank=False, null=False)
    type = models.CharField(max_length=30, blank=False, null=False)
    shift_id = models.IntegerField(blank=False)
    date = models.DateField(blank=False, null=False)
    total = models.FloatField(editable=False)

    def __str__(self):
        return f"{self.operation_id} - {self.type}"

    def save(self, *args, **kwargs):
        operation_hoopers = Operation_hoopers.objects.filter(operation=self)
        self.total = sum(hooper.total for hooper in operation_hoopers)
        super(Operations, self).save(*args, **kwargs)

    class Meta:
        unique_together = ('operation_id', 'type')


class Operation_hoopers(models.Model):
    operation = models.ForeignKey(Operations, on_delete=models.PROTECT)
    hooper_id = models.CharField(max_length=30, blank=False, null=False)
    value = models.FloatField(blank=False, null=False)
    count = models.IntegerField(blank=False, null=False)
    currency = models.CharField(max_length=30, blank=False, null=False)
    operation_type = models.CharField(max_length=30, blank=False, null=False)
    total = models.FloatField(editable=False)

    def save(self, *args, **kwargs):
        # Calculate the total based on count and value
        self.total = float(self.count) * float(self.value)
        super(Operation_hoopers, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.hooper_id} - {self.operation_type}"

    class Meta:
        unique_together = ('hooper_id', 'operation', 'operation_type')

