#
# CGS 2060 – Fall Semester 2021
#
# Homework #3: Stocking The Warehouse
#
# Hasan Zaidi (U25482986)
# Daiki Ozawa (U07178581)

from HW3ShipingRoutines import loadTruck
from HW3ShipingRoutines import shipBeer

WORLD = 0
largeTruckMaxLoad = 80000
mediumTruckMaxLoad = 20000
smallTruckMaxLoad = 2000

'''
inventory
    0:warehouseID
    1:kegs
    2:boxsOfBottles
    3:casesOfCans

truckContents
    0:numKegs
    1:numBoxs
    2:numCases
'''

largeTruckRemainingCapacity = 0  # Remaining hauling capacity of the large truck
mediumTruckRemainingCapacity = 0  # Remaining hauling capacity of the medium truck
remainingOrder = []   # Amount of order remaining to be loaded into truck - truckContents

warehouseBeerNeeds = []  # Stores the amount of inventory requested by each warehouse - inventory

copyWarehouseBeerNeeds = []  # Stores copy of the amount of inventory requested by each warehouse - inventory

#

numKegs = 0  # Holders of brewery beer inventory
numBottleBoxes = 0
numCanCases = 0

timeElapsed = 0  # Amount of time required to make deliveries to warehouses
warehouseStart = 0  # Identify the first warehouse to visit when delivering product

currentTruckLoad = []  # truckContents

def printall():
    infile = open('HW #3 Data.txt','r')
    line1Data = infile.readline()
    line2Data = infile.readline()
    line3Data = infile.readline()
    print()
    print('Number of kegs to be shipped: {}'.format(line1Data))
    print('Number of boxes of bottles to be shipped: {}'.format(line2Data))
    print('Number of cases of cans to be shipped: {}'.format(line3Data))
    return ''


def formatting(*args):
    infile = open('HW #3 Data.txt', 'r')
    line1Data = infile.readline()
    line2Data = infile.readline()
    line3Data = infile.readline()
    line4DataTable = infile.readline()
    line5DataTable = infile.readline()
    line5DataTable = line5DataTable.split()
    line4DataTable = line4DataTable.split()
    for elem in line4DataTable:
        print(f'{elem:^16}',end='')

    print()
    for elem in line5DataTable:
        print(f'{elem:^16}',end='')

    return ''


print(printall())

print('Warehouse ID        # Kegs      # Bottle Boxes   # Cases Of Cans')
print(formatting())

print()

print('=== Delivery Strategy #1: Satisfy each store one by one starting with \
furthest away')

print()

print('>>> Processing large truck for warehouse #1')

a = loadTruck(largeTruckMaxLoad, 400, 400, 700)
a = ''
print(a)

#
print('>>> Processing medium truck for Warehouse # 1')

b = loadTruck(mediumTruckMaxLoad, 0, 0, 220)
b = ''
print(b)

#
first = shipBeer(1)
print('Warehouse processing is done. Time elapsed is: {} minutes'.format(first))

print()

print('>>> Processing large truck for warehouse #{}'.format(warehouseStart))

c = loadTruck( largeTruckMaxLoad, 1200, 300, 600)
c = ''
print(c)

print('processing medium truck for warehouse #{}'.format(warehouseStart))


d = loadTruck(mediumTruckMaxLoad, 628, 300, 600)
d = ''
print(d)

print('>>> Processing the small truck for warehouse #{}'.format(warehouseStart))

e = loadTruck(smallTruckMaxLoad, 485, 300, 600)
e = ''
print(e)

second = first + shipBeer(0)
print('Warehouse processing is done. Time elapsed is: {}'.format(second))


print()

print('>>> Processing large truck for warehouse #{}'.format(warehouseStart))

f = loadTruck(largeTruckMaxLoad, 470, 300, 600)
f = ''
print(f)



print('>>> Processing medium truck for warehouse #{}'.format(warehouseStart))

g = loadTruck(mediumTruckMaxLoad, 0, 0, 430)
g = ''
print(g)

# 0 indicates the warehouse number

third = second + shipBeer(0)


print('Warehouse processing is done. Time Elapsed: {} minutes'.format(third))


totalTime = (third / 60)
totalTimeHours = third//60
totalTimeMinutes = (totalTime - totalTimeHours) * 60

print('=== Delivery strategy #1: time required to make deliveries: {} hours, {}\
 minutes.'.format(totalTimeHours,int(totalTimeMinutes)))



print()
print()


print('=== Delivery Strategy #2: Satisfy each store one by one starting with the \
closest one.')

print()
print('>>>Processing the large truck for warehouse # {}'.format(warehouseStart))

h = loadTruck(largeTruckMaxLoad,1200,300,600)
h = ''
print(h)

print('>>>Prcoessing Medium truck for warehouse # {}'.format(warehouseStart))

i = loadTruck(mediumTruckMaxLoad,628,300,600)
i = ''
print(i)

print('>>>Processign the small truck for warehouse # {}'.format(warehouseStart))

j = loadTruck(smallTruckMaxLoad,485,300,600)
j = ''
print(j)

fourth = shipBeer(0)

print('Time Elapsed is {} minutes'.format(fourth))

#'''for nKegs,nBottleBoxes,nCanCases in j:
#   print(nKegs)'''

print('>>>Processing large truck for warehouse # {}'.format(warehouseStart))

k = loadTruck(largeTruckMaxLoad,470,300,600)
k = ''
print(k)

print('>>>Processing medium truck for warehouse # {}'.format(warehouseStart))

l = loadTruck(mediumTruckMaxLoad,0,0,430)
l = ''
print(l)


fifth = fourth + shipBeer(0)

print('Time elapsed is {} minutes'.format(fifth))



print('>>>Processing large truck for warehouse # {}'.format(warehouseStart+1))

m = loadTruck(largeTruckMaxLoad,400,400,700)
m = ''
print(m)

print('>>>Processing medium truck for warehouse # {}'.format(warehouseStart+1))

n = loadTruck(mediumTruckMaxLoad,0,0,220)
n = ''
print(n)

sixth = fifth + shipBeer(1)

print('Time Elapsed is: {} minutes'.format(sixth))

#


totalTime = (sixth / 60)
totalTimeHours = sixth//60
totalTimeMinutes = (totalTime - totalTimeHours) * 60

print('=== Delivery strategy #2: time required to make deliveries: {} hours, {}\
 minutes.'.format(totalTimeHours,int(totalTimeMinutes)))



