largeTruckMaxLoad = 80000
mediumTruckMaxLoad = 20000
smallTruckMaxLoad = 2000

kegWeight = 140
boxOfBottlesWeight = 36
caseOfCansWeight = 20

shippingTimes = [[0,5,10],
                 [5,0,5],
                 [10,5,0]]

'''
/*
 * Function Name: loadTruck
 *
 * Description:
 * This function loads a truck with the remaining inventory for a given warehouse.
 * Loading will continue until the truck's weight capacity is reached.
 *
 * Inputs:
 *      int truckHaulingCapacity - the gallons of beer to be bottled
 *      int kegOrder - the number of kegs ordered by the warehouse
 *      int bottleOrder - the number of boxes of bottles ordered by the warehouse
 *      int canOrder - the number of cases of cans ordered by the warehouse
 *
 * Outputs:
 *      struct truckContents currentTruckContents - the number of kegs, boxes of bottles, and cases of cans left in order to load
 */
 '''

def loadTruck (truckHaulingCapacity,kegOrder, bottleOrder, canOrder):

    print("\nAmount That Still Needs To Be Shipped:")
    print("{} kegs, {} boxes of bottles, and {} cases of cans".format(kegOrder,bottleOrder,canOrder))

    # Declare function variables
    currentTruckContents = [] # truckContents
    truckRemainingCapacity = 0

    # Load the large truck first with as much as it can carry
    truckRemainingCapacity = truckHaulingCapacity # Initialize the amount of weight the truck can carry

    while ((truckRemainingCapacity >= caseOfCansWeight) and ((kegOrder > 0) or (bottleOrder > 0) or (canOrder > 0))):
        if (kegOrder > 0):
            kegOrder = kegOrder - 1
            truckRemainingCapacity = truckRemainingCapacity - kegWeight

        elif (bottleOrder > 0):
            bottleOrder -= 1
            truckRemainingCapacity = truckRemainingCapacity - boxOfBottlesWeight

        elif (canOrder > 0):
            canOrder -= 1
            truckRemainingCapacity = truckRemainingCapacity - caseOfCansWeight

    currentTruckContents.append(kegOrder)
    currentTruckContents.append(bottleOrder)
    currentTruckContents.append(canOrder)

    print("\nRemaining order yet to be processed consists of:")
    print("{0} kegs, {1} boxes of bottles, and {2} cases of cans".format(currentTruckContents[0],currentTruckContents[1],currentTruckContents[2]))

    return(currentTruckContents)


'''
/*
 * Function Name: shipBeer
 *
 * Description:
 * This function sends all loaded trucks to the selected warehouse, has them unloaded, and then return.
 * The amount of time required to do this is calculated.
 *
 * Inputs:
 *      int storeID - the warehouse that the delivery is going to
 *
 * Outputs:
 *      shipTime - the amount of time that this delivery took
 */
 '''

def shipBeer(storeID):

    # Local Variables
    shipTime = 0

    shipTime = 60 + (shippingTimes[0][storeID]) * 2 + 30
    return(shipTime)