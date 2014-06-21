Jumpstart Populator
=========================
Automates population of mongodb for an instance of jumpstart

If you plan to use this, create a clean instance of jumpstart and either put this in the root of the directory or add 
```
--jumpstartpath=your_jumpstart_path
```
to the command

Additionally, if its not a clean directory, it will result in an error. I will probably clean this up just to be a message and exit.
If you wish to run it on a dirty jumpstart instance you can add
```
--force=true
```
This will delete everything in your database as well as all models in your models folder.

It then creates Crazy Cat Ladies, Apartment Managers and Cats for your testing purposes


========================
Building without video can be done currently
To incorperate video you will need to...
```
sudo apt-get install autotools-dev
sudo apt-get install automake
sudo apt-get install mjpegtools
sudo apt-get install vpx-tools
sudo apt-get install ffmpeg

cd libvpx_modules/yasm
./autogen.sh
make
# make install

cd libvpx_modules/libvpx
./configure
make
# make install

npm install

node index
```

Its not how I prefer, but since video encoding is much different from image encoding, its what I had to do.
