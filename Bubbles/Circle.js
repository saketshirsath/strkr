import React, {useCallback, useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {useGravityAnimation} from './useGravityAnimation';
import Animated from 'react-native-reanimated';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPeopleArrows, faUserGroup} from '@fortawesome/free-solid-svg-icons';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';

export const AnimatedCircleGroup = ({
  habits,
  isGroup,
  onLongPressHabit,
  onTapHabit,
}) => {
  const [viewDimensions, setViewDimensions] = useState(undefined);
  const handleLayout = useCallback(event => {
    const {width, height} = event.nativeEvent.layout;
    setViewDimensions({width, height});
  }, []);

  const isCanvasReady = viewDimensions !== undefined;

  return (
    <View style={styles.flex} onLayout={handleLayout}>
      {isCanvasReady && (
        <AnimatedCircleGroupInner
          isGroup={isGroup}
          habits={habits}
          dimensions={viewDimensions}
          onTapHabit={onTapHabit}
          onLongPressHabit={onLongPressHabit}
        />
      )}
    </View>
  );
};

export function AnimatedCircleGroupInner({
  dimensions,
  isGroup,
  habits,
  onTapHabit,
  onLongPressHabit,
}) {
  const circles = useGravityAnimation(dimensions, habits);

  return (
    <ReactNativeZoomableView
      maxZoom={1.5}
      minZoom={0.5}
      zoomStep={0.5}
      initialZoom={1}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {circles.map((p, index) => {
        return (
          <Circle
            isGroup={isGroup}
            key={index}
            index={index}
            onLongPressHabit={onLongPressHabit}
            onTapHabit={onTapHabit}
            translateX={p.x}
            translateY={p.y}
            diameter={p.diameter}
            habit={p.habit}
            color={p.color}
          />
        );
      })}
    </ReactNativeZoomableView>
  );
}

export const Circle = props => {
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
  const {
    translateX,
    translateY,
    diameter,
    habit,
    onLongPressHabit,
    onTapHabit,
    index,
    isGroup,
  } = props;

  const title = isGroup
    ? habit.firstName == null
      ? 'You'
      : habit.firstName
    : habit.streakName;
  return (
    <AnimatedTouchable
      onLongPress={() => onLongPressHabit(index, habit)}
      onPress={() => onTapHabit(index, habit)}
      style={{
        opacity: true ? 1 : 0.5,
        transform: [{translateX}, {translateY}],
        position: 'absolute',
        width: diameter,
        height: diameter,
        borderRadius: diameter / 2,
        backgroundColor: habit.primaryColor,
      }}>
      <View
        style={{
          width: diameter,
          height: diameter,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        {habit == null ||
        habit.friends == null ||
        habit.friends.length <= 0 ||
        isGroup ? null : (
          <FontAwesomeIcon
            icon={faUserGroup}
            style={{color: 'white', height: 5, width: 5}}
          />
        )}
        <View style={{margin: 5}}>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              color: 'white',
              textAlign: 'center',
            }}>
            {title}
          </Text>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              color: 'white',
              textAlign: 'center',
            }}>
            {habit.completionCount}
          </Text>
        </View>
      </View>
    </AnimatedTouchable>
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
