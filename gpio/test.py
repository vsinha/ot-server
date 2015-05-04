import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.IN, pull_up_down = GPIO.PUD_UP)

def printFunction(channel):
	print("button press detected")

GPIO.add_event_detect(18, GPIO.RISING, callback=printFunction, bouncetime=900)

while True:
	time.sleep(1)

#while True:
#	if GPIO.input(18) == False:
#		print ("Button pressed")
#		time.sleep(0.5)

GPIO.cleanup()




