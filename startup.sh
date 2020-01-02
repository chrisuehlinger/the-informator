#!/bin/bash

cd ../orbital;
npm start &

cd ../the-informator;
node bin/www

