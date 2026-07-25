import { Pressable, type PressableProps } from 'react-native';

import { pressFeedback, useReducedMotion } from './premium';

type Feedback = 'quiet' | 'control' | 'primary';

type Props = Omit<PressableProps, 'style'> & {
  feedback?: Feedback;
  style?: PressableProps['style'];
};

export function FocoPressable({ feedback = 'control', style, ...props }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <Pressable
      {...props}
      style={(state) => {
        const baseStyle = typeof style === 'function' ? style(state) : style;
        if (!state.pressed) return baseStyle;
        const activeFeedback = pressFeedback[feedback];
        const resolvedFeedback = reducedMotion
          ? { opacity: activeFeedback.opacity }
          : activeFeedback;
        return [baseStyle, resolvedFeedback];
      }}
    />
  );
}
