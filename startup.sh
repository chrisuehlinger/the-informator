#!/bin/bash

cd ../orbital;
npm start &

cd ../the-informator;
sudo node bin/www

