import datetime
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import *
from rest_framework.permissions import IsAdminUser 
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import Operations_hoopersSerializer, Parking_lotSerializer, OperationsSerializer, Payment_machineSerializer
from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework import status

# //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                                                      login 
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def login(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token
 
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

#############################################################################################################################################################################
#                                                                check who was logged

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def type_logged(request):
    if request.user.is_superuser:
        return Response("superuser")
    elif request.user.is_staff:
        return Response("staff")

# /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                                register for new customers (only admin can add users)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def register(request):
    # Check if the username already exists
    username = request.data.get('username')
    if User.objects.filter(username=username).exists():
        return Response("User name already exists", status=status.HTTP_400_BAD_REQUEST)

    # Create the user if the username is unique
    user = User.objects.create_user(
        username=request.data['username'],
        email=request.data['email'],
        password=request.data['password'],
    )
    user.is_active = True
    user.is_staff = True
    user.save()
    return Response("New user created", status=status.HTTP_201_CREATED)

# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                      login for the users and get their parking_lots data (for admins diaply all parking lots)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_parking_lots(request):
    user = request.user
    if user.is_superuser:
        parking_lots = Parking_lot.objects.all()
    else:
        parking_lots = Parking_lot.objects.filter(username=user)

    parking_lot_data = [
        {
            'parking_lot_id': parking_lot.parking_lot_id,
            'parking_lot_name': parking_lot.parking_lot_name,
        }
        for parking_lot in parking_lots
    ]
    return Response(parking_lot_data)
# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                                   disply for each parking lot his machines & operation and operation hoopers
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parking_lot_data(request, parking_lot_id):
    try:
        # Get the parking lot
        parking_lot = Parking_lot.objects.get(parking_lot_id=parking_lot_id)

        # Get the payment machines associated with the parking lot
        machines = Payment_machine.objects.filter(parking_lot=parking_lot)

        # Initialize a dictionary to store the details for each machine
        machine_details = {}

        # Iterate over each machine
        for machine in machines:
            # Get the operations associated with the machine
            operations = Operations.objects.filter(machine=machine)

            # Initialize a list to store the operation details for the machine
            operation_details = []

            # Iterate over each operation
            for operation in operations:
                # Get the operation hoopers associated with the operation
                hoopers = Operation_hoopers.objects.filter(operation=operation)

                # Initialize a list to store the hooper details for the operation
                hooper_details = []

                # Iterate over each hooper
                for hooper in hoopers:
                    # Calculate the total based on count and value
                    total = str(int(hooper.count) * int(hooper.value))

                    # Append the hooper details to the list
                    hooper_details.append({
                        'hooper_id': hooper.hooper_id,
                        'operation_type': hooper.operation_type,
                        'value': hooper.value,
                        'count': hooper.count,
                        'currency': hooper.currency,
                        'total': total  # Include the total
                    })

                # Calculate the total for the operation by summing the hooper totals
                operation_total = sum(int(hooper['total']) for hooper in hooper_details)

                # Append the operation details to the list
                operation_details.append({
                    'operation_id': operation.operation_id,
                    'type': operation.type,
                    'date': operation.date,
                    'hoopers': hooper_details,
                    'total': str(operation_total),  # Include the operation total
                    'shift_id': operation.shift_id  # Include the shift_id
                })

            machine_details[machine.machine_id] = {
                'machine_id': machine.machine_id,
                'display_name': machine.display_name,
                'operation_details': operation_details
            }

        return Response(machine_details)

    except Parking_lot.DoesNotExist:
        # Handle the case when the parking lot does not exist
        return Response({'error': 'Parking lot does not exist'})



# ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
# #                                                add the operation and the operation hoopers togheter
# @api_view(['POST'])
# @permission_classes([IsAdminUser])
# def add_operation_with_details(request):
#     try:
#         # Get the token from the request headers
#         token = request.headers.get('token')

#         # Get the machine associated with the provided token
#         machine = Payment_machine.objects.get(token=token)

#         # Get the operations data
#         operations_data = request.data

#         # Create variables to store the counts
#         success_count = 0
#         duplicate_count = 0
#         incorrect_count = 0

#         # Create lists to store the incorrect records
#         duplicate_records = []
#         incorrect_records = []

#         # Iterate over the operations data
#         for operation_data in operations_data:
#             try:
#                 # Get or create the operation
#                 operation_id = operation_data['operation_id']
#                 operation_type = operation_data['type']
#                 shift_id = operation_data['shift_id']
#                 date = operation_data['date']

#                 # Check if the operation already exists
#                 try:
#                     operation, created = Operations.objects.get_or_create(
#                         operation_id=operation_id,
#                         type=operation_type,
#                         shift_id=shift_id,
#                         date=date,
#                         machine=machine
#                     )
#                     if created:
#                         success_count += 1
#                     else:
#                         duplicate_records.append({
#                             'operation_id': operation_id,
#                             'type': operation_type
#                         })
#                         duplicate_count += 1
#                         continue
#                 except IntegrityError:
#                     duplicate_records.append({
#                         'operation_id': operation_id,
#                         'type': operation_type
#                     })
#                     duplicate_count += 1
#                     continue

#                 # Get the hoopers data
#                 hoopers_data = operation_data.get('hoopers', [])

#                 # Create a list to store the hooper details
#                 hooper_details = []

#                 # Iterate over the hoopers data
#                 for hooper_data in hoopers_data:
#                     hooper_id = hooper_data['hooper_id']
#                     value = hooper_data['value']
#                     count = hooper_data['count']
#                     currency = hooper_data['currency']
#                     # hooper_operation_type = hooper_data['operation_type']

#                     # Check if the hooper already exists
#                     try:
#                         hooper = Operation_hoopers.objects.create(
#                             hooper_id=hooper_id,
#                             operation=operation,
#                             # operation_type=hooper_operation_type,
#                             value=value,
#                             count=count,
#                             currency=currency
#                         )
#                         hooper_details.append({
#                             'hooper_id': hooper_id,
#                             'value': value,
#                             'count': count,
#                             'currency': currency,
#                             # 'operation_type': hooper_operation_type
#                         })
#                     except IntegrityError:
#                         incorrect_records.append({
#                             'hooper_id': hooper_id,
#                             # 'type': hooper_operation_type
#                         })
#                         incorrect_count += 1
#                         continue

#                 # Update the operation total
#                 operation.save()

#             except Exception as e:
#                 incorrect_records.append({
#                     'operation_id': operation_id,
#                     'type': operation_type,
#                     'error_message': str(e)
#                 })
#                 incorrect_count += 1
#                 continue

#         # Determine the appropriate status code based on the counts
#         if incorrect_count > 0:
#             status_code = status.HTTP_207_MULTI_STATUS
#         elif duplicate_count > 0:
#             status_code = status.HTTP_208_ALREADY_REPORTED
#         else:
#             status_code = status.HTTP_200_OK

#                 # Create the response data
#         response_data = {
#             'success_count': success_count,
#             'duplicate_count': duplicate_count,
#             'incorrect_count': incorrect_count,
#             'duplicate_records': duplicate_records,
#             'incorrect_records': incorrect_records
#         }

#         return Response(response_data, status=status_code)

#     except Payment_machine.DoesNotExist:
#         return Response("Invalid token.", status=status.HTTP_400_BAD_REQUEST)

#     except Exception as e:
#         return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_operation_with_details(request):
    from datetime import datetime  # Add this line

    try:
        # Get the token from the request headers
        token = request.headers.get('token')

        # Get the machine associated with the provided token
        machine = Payment_machine.objects.get(token=token)

        # Get the operations data
        operations_data = request.data

        # Create variables to store the counts
        success_count = 0
        duplicate_count = 0
        incorrect_count = 0

        # Create lists to store the incorrect records
        duplicate_records = []
        incorrect_records = []

        # Iterate over the operations data
        for operation_data in operations_data:
            try:
                # Get or create the operation
                operation_id = operation_data['operation_id']
                operation_type = operation_data['type']
                shift_id = operation_data['shift_id']
                date = operation_data['date']
                parsed_date = datetime.strptime(date.split()[0], '%Y-%m-%d').date()

                # Check if the operation already exists
                try:
                    operation, created = Operations.objects.get_or_create(
                        operation_id=operation_id,
                        type=operation_type,
                        shift_id=shift_id,
                        date=parsed_date,
                        machine=machine
                    )
                    if created:
                        success_count += 1
                    else:
                        duplicate_records.append({
                            'operation_id': operation_id,
                            'type': operation_type
                        })
                        duplicate_count += 1
                        continue
                except IntegrityError:
                    duplicate_records.append({
                        'operation_id': operation_id,
                        'type': operation_type
                    })
                    duplicate_count += 1
                    continue

                # Get the hoopers data
                hoopers_data = operation_data.get('hoopers', [])

                # Create a list to store the hooper details
                hooper_details = []

                # Iterate over the hoopers data
                for hooper_data in hoopers_data:
                    hooper_id = hooper_data['hooper_id']
                    value = hooper_data['value']
                    count = hooper_data['count']
                    currency = hooper_data['currency']

                    # Check if the hooper already exists
                    try:
                        hooper = Operation_hoopers.objects.create(
                            hooper_id=hooper_id,
                            operation=operation,
                            value=value,
                            count=count,
                            currency=currency,
                        )
                        hooper_details.append({
                            'hooper_id': hooper_id,
                            'value': value,
                            'count': count,
                            'currency': currency
                        })
                    except IntegrityError:
                        incorrect_records.append({
                            'hooper_id': hooper_id,
                        })
                        incorrect_count += 1
                        continue

                # Update the operation total
                operation.save()

            except Exception as e:
                incorrect_records.append({
                    'operation_id': operation_id,
                    'type': operation_type,
                    'error_message': str(e)
                })
                incorrect_count += 1
                continue


        # Determine the appropriate status code based on the counts
        if incorrect_count > 0:
            status_code = status.HTTP_207_MULTI_STATUS
        elif duplicate_count > 0:
            status_code = status.HTTP_208_ALREADY_REPORTED
        else:
            status_code = status.HTTP_200_OK

                # Create the response data
        response_data = {
            'success_count': success_count,
            'duplicate_count': duplicate_count,
            'incorrect_count': incorrect_count,
            'duplicate_records': duplicate_records,
            'incorrect_records': incorrect_records
        }

        return Response(response_data, status=status_code)

    except Payment_machine.DoesNotExist:
        return Response("Invalid token.", status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

           


           









# /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
# //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////`///////////////////////////////////
# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                              add parking_lot to the system (only admin can add a parking lot)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_parking_lot(request):
    try:
        username = request.data['username']
        custom_user = User.objects.get(username=username)
        parking_lot = Parking_lot.objects.create(
            parking_lot_id=request.data['parking_lot_id'],
            parking_lot_name=request.data['parking_lot_name'],
            username=custom_user  # Assign the User instance to the 'username' field
        )
        serializer = Parking_lotSerializer(parking_lot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response("Custom user does not exist.", status=status.HTTP_404_NOT_FOUND)
    
# //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                              add payment machine to the system (only admin can add a payment machine)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_payment_machine(request):
    try:
        parking_lot = Parking_lot.objects.get(parking_lot_id=request.data['parking_lot_id'])
        machine_data = {
            'machine_id': request.data['machine_id'],
            'display_name': request.data['display_name'],
            'token':request.data['token'],
            'parking_lot': parking_lot.pk
        }
        machine_serializer = Payment_machineSerializer(data=machine_data)
        if machine_serializer.is_valid():
            machine_serializer.save()
            return Response(machine_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(machine_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Parking_lot.DoesNotExist:
        return Response("Parking lot does not exist.", status=status.HTTP_404_NOT_FOUND)

    
# ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                                Add a operation for the mechine (only aadmin can add operation)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_operation(request):
    try:
        Machine = Payment_machine.objects.get(machine_id=request.data['machine_id'])
        operation = Operations.objects.create(operation_id=request.data['operation_id'], type=request.data['type'], shift_id=request.data['shift_id'], date=request.data['date'], machine_id=Machine.pk)
        serializer = OperationsSerializer(operation) 
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response("payment machine does not exist.", status=status.HTTP_404_NOT_FOUND)
    
# /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                               Add operation details to each operation (only admin can add operation details)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_operation_details(request):
    operation_id = request.data['operation_id']
    operation_type = request.data['operation_type']

    if Operations.objects.filter(operation_id=operation_id, type=operation_type).exists():
        operation = Operations.objects.get(operation_id=operation_id)
        operation_details = Operation_hoopers.objects.create(
            hooper_id=request.data['hooper_id'],
            value=request.data['value'],
            count=request.data['count'],
            currency=request.data['currency'],
            operation_type=operation_type,
            operation=operation
        )
        serializer = Operations_hoopersSerializer(operation_details)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response("Operation does not exist.", status=status.HTTP_404_NOT_FOUND)
# /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                               display for the parking lot his payment machine
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_payment_machines(request, parking_lot_id):
    try:
        parking_lot = Parking_lot.objects.get(parking_lot_id=parking_lot_id)
        machines = Payment_machine.objects.filter(parking_lot=parking_lot)
        machine_data = [{'machine_id': machine.machine_id} for machine in machines]
        return Response(machine_data)
    except Parking_lot.DoesNotExist:
        return Response("Parking lot does not exist.", status=status.HTTP_404_NOT_FOUND)

# //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                                       display for each machine his operations
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_operations(request, machine_id):
    try:
        machine = Payment_machine.objects.get(machine_id=machine_id)
        operations = Operations.objects.filter(machine=machine)
        operation_data = [{'operation_id': operation.operation_id, 'type':operation.type, "shift id":operation.shift_id, "date":operation.date} for operation in operations]
        return Response(operation_data)
    except Parking_lot.DoesNotExist:
        return Response("Parking lot does not exist.", status=status.HTTP_404_NOT_FOUND)
    
# //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#                                                   display  for each operation his operation details
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_operation_details(request, operation_id):
    try:
        operation = Operations.objects.get(operation_id=operation_id)
        operation_details = Operation_hoopers.objects.filter(operation=operation)
        operation_details_data = [{'operation_id': operationD.operation_id, 'operation_type':operationD.operation_type, "hooper id":operationD.hooper_id, "value":operationD.value, "count":operationD.count, "currency":operationD.currency} for operationD in operation_details]
        return Response(operation_details_data)
    except Parking_lot.DoesNotExist:
        return Response("Parking lot does not exist.", status=status.HTTP_404_NOT_FOUND)














