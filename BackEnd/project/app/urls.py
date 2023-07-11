from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('register', views.register),
    path('login', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('type_logged', views.type_logged),
    path ('add_all_data', views.add_operation_with_details),
     path('parking_lot_data/<str:parking_lot_id>/', views.parking_lot_data),
 
    path('add_parking_lot', views.add_parking_lot),
    path('add_machine', views.add_payment_machine),
    path('add_operation', views.add_operation),
    path('add_operation_details', views.add_operation_details),

    path('my_parking_lots', views.my_parking_lots),
    path('my_machines/<str:parking_lot_id>/', views.my_payment_machines),
    path('my_operations/<str:machine_id>/', views.my_operations),
    path('my_operation_details/<str:operation_id>/', views.my_operation_details)
]
