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








'''def CALC(noKegs, noBottles, noCans):
    weight = noKegs * 140 + noBottles * 36 + noCans * 20
    LMS = [largeTruckMaxLoad,mediumTruckMaxLoad,smallTruckMaxLoad]
    while weight <= 2000:
        LMS = LMS[2]
        calcualtion = LMS - ((numKegs * 140) + (numBottleBoxes * 36) + (numCanCases * 20))
        while calcualtion > 0 and calcualtion <= 2000:
            print(lightWeight(CALC(noKegs,noBottles,noCans)))
'''
'''
 calcualtion = largeTruckMaxLoad - ((numKegs * 140) + (numBottleBoxes * 36) + (numCanCases * 20))
    while calcualtion != 0:
        if weight <= 2000:
            LMS = smallTruckMaxLoad
            loadingProcess = loadTruck(LMS,noKegs,noBottles,noCans)
            return (loadingProcess)

        elif weight <= 20000:
            LMS = mediumTruckMaxLoad
            loadingProcess = loadTruck(LMS,noKegs,noBottles,noCans)
            return loadingProcess

        elif weight <= 80000:
            LMS = largeTruckMaxLoad
            loadingProcess = loadTruck(LMS,noKegs,noBottles,noCans)
            print(loadingProcess)
'''
noKegs = 400
noBottles = 400
noCans = 700

weight = noKegs * 140 + noBottles * 36 + noCans * 20

def lightWeight():
    x = loadTruck(smallTruckMaxLoad,noKegs, noBottles, noCans)
    print(x)

def mediumWeight():
    x = loadTruck(mediumTruckMaxLoad,noKegs,noBottles,noCans)
    print(x)

def heavyWeight():
    x = loadTruck(largeTruckMaxLoad,noKegs,noBottles,noCans)
    print(x)

while weight <= 2000:
    print(lightWeight())

while weight <= 40000:
    print(mediumWeight())

while weight <= 80000:
    print(heavyWeight())






