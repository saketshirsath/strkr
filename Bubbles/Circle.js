import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useGravityAnimation} from './useGravityAnimation';
import Animated from 'react-native-reanimated';

export function AnimatedCircleGroup() {
  const [viewDimensions, setViewDimensions] = useState(undefined);
  const handleLayout = useCallback(event => {
    const {width, height} = event.nativeEvent.layout;
    setViewDimensions({width, height});
  }, []);

  const isCanvasReady = viewDimensions !== undefined;

  return (
    <View style={styles.flex} onLayout={handleLayout}>
      {isCanvasReady && (
        <AnimatedCircleGroupInner dimensions={viewDimensions} />
      )}
    </View>
  );
}

export function AnimatedCircleGroupInner({dimensions}) {
  const circles = useGravityAnimation(dimensions);

  return (
    <View style={styles.wrap}>
      {circles.map((p, index) => {
        return (
          <Circle key={index} translateX={p.x} translateY={p.y} diameter={50} />
        );
      })}
    </View>
  );
}

export const Circle = ({translateX, translateY, diameter}) => {
  const radius = diameter / 2;

  return (
    <Animated.View
      style={{
        transform: [{translateX}, {translateY}],
        position: 'absolute',
        width: diameter,
        height: diameter,
        borderRadius: radius,
        backgroundColor: 'red',
      }}></Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
