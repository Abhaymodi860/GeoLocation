import React, {useState, useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {accelerometer, gyroscope, magnetometer} from 'react-native-sensors';

const App = () => {
  const [isPositionStable, setIsPositionStable] = useState(false);
  const [position, setPosition] = useState(null);
  const [orientation, setOrientation] = useState({});

  useEffect(() => {
    // Request location permission
    Geolocation.requestAuthorization();

    // Watch for location changes
    const watchId = Geolocation.watchPosition(
      currentPosition => {
        const {latitude, longitude} = currentPosition.coords;

        // Check stability condition (customize this based on your requirements)
        const isStable = currentPosition.coords.accuracy < 10; // Example: If accuracy is less than 10 meters, consider it stable

        setIsPositionStable(isStable);
        setPosition({
          latitude,
          longitude,
          accuracy: currentPosition.coords.accuracy,
        });
      },
      error => console.log('Error watching location:', error),
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    // Set up sensors for orientation
    const subscription = accelerometer.subscribe(({x, y, z}) => {
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      setOrientation({angle});
    });

    // Clean up watches when the component unmounts
    return () => {
      Geolocation.clearWatch(watchId);
      subscription.unsubscribe();
    };
  }, []);

  const getDirection = () => {
    if (orientation.angle !== undefined) {
      const directions = [
        'North',
        'North-East',
        'East',
        'South-East',
        'South',
        'South-West',
        'West',
        'North-West',
      ];
      const index = Math.round((orientation.angle % 360) / 45);
      return directions[index % 8];
    }
    return 'Unknown';
  };

  const handleRecordPosition = () => {
    // Take a screenshot or any other action to memorize the position and heading
    console.log('Position recorded:', position);
    console.log('Heading:', getDirection());
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{marginBottom: 20}}>
        Position Stability: {isPositionStable ? 'Stable' : 'Not Stable'}
      </Text>
      <Text style={{marginBottom: 20}}>Direction: {getDirection()}</Text>
      <Button
        title="Record Position"
        onPress={handleRecordPosition}
        disabled={!isPositionStable}
        color={isPositionStable ? 'green' : 'red'}
      />
      {position && (
        <View style={{marginTop: 20}}>
          <Text>Latitude: {position.latitude}</Text>
          <Text>Longitude: {position.longitude}</Text>
          <Text>Accuracy: {position.accuracy} meters</Text>
        </View>
      )}
    </View>
  );
};

export default App;
