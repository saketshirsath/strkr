/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

/*

const canvasWidth = 600;
const canvasHeight = 600;

const numCircles = 10;
let circles;

function setup() {
  createCanvas(canvasWidth, canvasHeight);

  const diagonal = Math.hypot(canvasWidth, canvasHeight);
  const diagonalHalf = diagonal / 2;

  circles = [];
  const angle = (2 * Math.PI) / numCircles;
  for (let i = 0; i < numCircles; i++) {
    const diameter = (i + 1) * 10;
    const randomOffsetAngle = random(-angle * 5, angle * 5);
    const randomOffsetDistance = random(0, diameter);

    const distance = diagonalHalf + diameter + randomOffsetDistance;
    const currentAngle = angle * i + randomOffsetAngle;
    const x = Math.sin(currentAngle) * distance;
    const y = Math.cos(currentAngle) * distance;

    circles.push({ x, y, diameter });
  }
  circles.push({ x: 20, y: 40, diameter: 10 });

  stroke("#ff000");
  fill("#ff000");
}


function mousePressed() {
  for (let i = 0; i < circles.length; i++) {
    const x = circles[i].x + canvasWidth / 2;
    const y = circles[i].y + canvasHeight / 2;
    
    const dist = Math.hypot(mouseX - x, mouseY - y);
    if (dist < circles[i].diameter / 2) {
        circles[i].diameter *= 1.2; 
    }
  }
}

function touchStarted() {
  print("hi")
  circles[2].diameter *= 1.2;
}

function draw() {
  background(220);

  for (const c of circles) {
    const x = c.x + canvasWidth / 2;
    const y = c.y + canvasHeight / 2;
    fill(255, 123, 123, 123);
    circle(x, y, c.diameter);
    fill(0, 102, 153, 51);
    text(c.x, x, y);
  }
  
  update();
}

function update() {
  for (let i = 0; i < circles.length; i++) {
    const circle = circles[i];

    circle.x += -circle.x * 0.01;
    circle.y += -circle.y * 0.01;
  }
  
  // Colision detection
  for (let i = 0; i < circles.length; i++) {
    for (let j = i; j < circles.length; j++) {
      const circleA = circles[i];
      const circleB = circles[j];

      const dx = circleB.x - circleA.x;
      const dy = circleB.y - circleA.y;
      const distanceBetweenCenters = Math.hypot(dx, dy);
      const totalDiameter = circleA.diameter/2 + circleB.diameter/2
      const areOverlapping = distanceBetweenCenters < totalDiameter;

      if (areOverlapping) {
        const overlapDistance = totalDiameter - distanceBetweenCenters;
        const percentOverlap = abs(overlapDistance / totalDiameter);

        const halfPercent = percentOverlap * 0.5;

        circleA.x -= dx * halfPercent;
        circleA.y -= dy * halfPercent;

        circleB.x += dx * halfPercent;
        circleB.y += dy * halfPercent;
      }
    }
  }
}




*/

import React, {useState} from 'react';
import type {Node} from 'react';
import {Habit} from './Model/Habit';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {AnimatedCircleGroup} from './Bubbles/Circle';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const onTapHabit = (index, tappedHabit) => {
    console.log('User tapped ' + tappedHabit.name);
    const newHabits = habits.slice();
    newHabits[index].streak += 1;
    setHabits(newHabits);
    console.log('Streak ' + habits[index].streak);
  };

  const onLongPressHabit = (index, pressedHabit) => {
    console.log('User long pressed ' + pressedHabit.name);
    const newHabits = habits.slice();
    newHabits[index].streak += 1;
    setHabits(newHabits);
    console.log('Streak ' + habits[index].streak);
  };

  const hardcodedHabits = [
    new Habit('Read', '#005F73', 25, []),
    new Habit('Study', '#0A9396', 5, []),
    new Habit('Meditate', '#CA6702', 8, []),
    new Habit('Wakeup Early', '#BB3E03', 15, []),
    new Habit('Walk Dog', '#AE2012', 30, []),
  ];

  const [habits, setHabits] = useState(hardcodedHabits);

  return (
    <SafeAreaView style={backgroundStyle}>
      <AnimatedCircleGroup
        habits={habits}
        onTapHabit={onTapHabit}
        onLongPressHabit={onLongPressHabit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default App;
