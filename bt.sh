#!/bin/sh
sudo service bluetooth stop
sleep 1
sudo killall bluedevil-helper
sudo killall bluedevil-monolithic
sudo killall blueman-applet
sudo hciconfig hci0 down
sleep 1
sudo hciconfig hci0 up
sudo hciconfig hci0 piscan
sleep 1
sudo hciconfig hci0 class 0x00000404
hcitool inq
echo 'Your bluetooth interface is now ready'
echo 'You should see the helicopter above (device of class 0x240404). Now launch blueman-manager to pair it with your computer.'
echo ''
echo 'Then you should see the beewii helicopter in the list of blueman-manager bluetooth devices even if the helicopter is disconnected.'
echo '(See screenshot.png)'
echo ''
echo 'Then launch server/server.sh and follow the instructions'