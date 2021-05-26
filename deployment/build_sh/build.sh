#
#
# build docker image
# anthor zhaol
#
#

# docker image name
IMAGENAME="prod-image-flightdemo:`date +%Y%m%d`01"
# docker Dockerfile path
DOCKERPATH="../"
# docker hup
DOCKERHUP="localhost:5000/"

# docker build 
docker build --build-arg DB_PUBKEY=$DB_PUBKEY -t $IMAGENAME $DOCKERPATH

# docker tag 
docker tag $IMAGENAME $DOCKERHUP$IMAGENAME

#docker push
docker push $DOCKERHUP$IMAGENAME
