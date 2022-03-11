import React, {useCallback, useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {useGravityAnimation} from './useGravityAnimation';
import Animated from 'react-native-reanimated';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPeopleArrows, faUserGroup} from '@fortawesome/free-solid-svg-icons';

export const AnimatedCircleGroup = ({habits, onLongPressHabit, onTapHabit}) => {
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
  habits,
  onTapHabit,
  onLongPressHabit,
}) {
  const circles = useGravityAnimation(dimensions, habits);

  return (
    <View style={styles.wrap}>
      {circles.map((p, index) => {
        return (
          <Circle
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
    </View>
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
  } = props;

  return (
    <AnimatedTouchable
      onLongPress={() => onLongPressHabit(index, habit)}
      onPress={() => onTapHabit(index, habit)}
      style={{
        transform: [{translateX}, {translateY}],
        position: 'absolute',
        width: diameter,
        height: diameter,
        borderRadius: diameter / 2,
        backgroundColor: habit.color,
      }}>
      <View
        style={{
          width: diameter,
          height: diameter,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        {habit == null || habit.groupUserIds.length <= 0 ? null : (
          <FontAwesomeIcon
            icon={faUserGroup}
            style={{color: 'white', height: 5, width: 5}}
          />
        )}
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{
            color: 'white',
            margin: 5,
            textAlign: 'center',
          }}>
          {habit.name}
        </Text>
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
