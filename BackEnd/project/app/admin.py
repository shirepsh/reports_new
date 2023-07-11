from django.contrib import admin
from .models import *

admin.site.register(Parking_lot)
admin.site.register(Payment_machine)
admin.site.register(Operations)
admin.site.register(Operation_hoopers)


# admin.site.register(Token_machine)