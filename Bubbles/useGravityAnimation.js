import React, {useMemo} from 'react';
import Animated, {
  abs,
  add,
  block,
  Clock,
  clockRunning,
  cond,
  divide,
  lessThan,
  multiply,
  set,
  sqrt,
  startClock,
  sub,
  useCode,
  Value,
} from 'react-native-reanimated';

const random = (min, max) => Math.random() * (max - min) + min;

let drewCircles = [];
export const useGravityAnimation = (dimensions, habits) => {
  drewCircles = useSetup(dimensions, habits);
  useDraw(drewCircles);

  return drewCircles;
};

const useSetup = (dimensions, habits) => {
  const circleCount = habits.length;
  const circles = useMemo(() => {
    const {width, height} = dimensions;
    const diagonal = Math.hypot(width, height);
    const diagonalHalf = diagonal / 2;
    const circles = [];

    const angle = (2 * Math.PI) / circleCount;
    for (let i = 0; i < circleCount; i++) {
      const circleDiameter = habits[i].streak * 10;

      if (drewCircles.length != 0 && i < drewCircles.length) {
        drewCircles[i].diameter = circleDiameter;
        drewCircles[i].d = new Value(circleDiameter);
        drewCircles[i].habit = habits[i];
        circles.push(drewCircles[i]);
      } else {
        const randomOffsetAngle = random(-angle * 0.4, angle * 0.4);
        const randomOffsetDistance = random(0, circleDiameter);

        const distance = diagonalHalf + circleDiameter + randomOffsetDistance;
        const currentAngle = angle * i + randomOffsetAngle;
        const x = Math.sin(currentAngle) * distance;
        const y = Math.cos(currentAngle) * distance;

        circles.push({
          x: new Value(x),
          y: new Value(y),
          d: new Value(circleDiameter),
          diameter: circleDiameter,
          habit: habits[i],
        });
      }
    }

    return circles;
  }, [habits]);

  return circles;
};

const useDraw = circles => {
  const nativeCode = useMemo(() => {
    const clock = new Clock();
    const runCode = [cond(clockRunning(clock), 0, startClock(clock)), clock];

    // gravity. We push cirlces to 0, 0
    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      runCode.push(
        set(
          circle.x,
          add(circle.x, multiply(add(circle.x, divide(circle.d, 2)), -0.01)),
        ),
      );
      runCode.push(
        set(
          circle.y,
          add(circle.y, multiply(add(circle.y, divide(circle.d, 2)), -0.01)),
        ),
      );
    }

    for (let i = 0; i < circles.length; i++) {
      for (let j = 0; j < circles.length; j++) {
        if (i == j) continue;
        const circleA = circles[i];
        const circleB = circles[j];
        const ax = add(circleA.x, divide(circleA.d, 2.0));
        const ay = add(circleA.y, divide(circleA.d, 2.0));
        const bx = add(circleB.x, divide(circleB.d, 2.0));
        const by = add(circleB.y, divide(circleB.d, 2.0));
        const dx = sub(bx, ax);
        const dy = sub(by, ay);
        const totalDiameter = add(
          divide(circleA.d, 2.0),
          divide(circleB.d, 2.0),
        );
        const distanceBetweenCenters = sqrt(
          add(multiply(dx, dx), multiply(dy, dy)),
        );

        const areOverlapping = lessThan(distanceBetweenCenters, totalDiameter);
        const overlapDistance = sub(totalDiameter, distanceBetweenCenters);
        const percentOverlap = abs(divide(overlapDistance, totalDiameter));
        const halfPercent = multiply(percentOverlap, 0.5);

        runCode.push(
          cond(areOverlapping, [
            set(circleA.x, sub(circleA.x, multiply(dx, halfPercent))),
            set(circleA.y, sub(circleA.y, multiply(dy, halfPercent))),
            set(circleB.x, add(circleB.x, multiply(dx, halfPercent))),
            set(circleB.y, add(circleB.y, multiply(dy, halfPercent))),
          ]),
        );
      }
    }
    return block(runCode);
  }, [circles]);
  useCode(() => nativeCode, [nativeCode]);
};
