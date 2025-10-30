// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import type { ComponentProps } from 'react';
import type { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'person.fill': 'person',
  'plus': 'add',
  'pencil': 'edit',
  'lock': 'lock',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'questionmark.circle': 'help',
  'info.circle': 'info',
  'rectangle.portrait.and.arrow.right': 'logout',
  'tshirt.fill': 'checkroom',
  'bag.fill': 'shopping-bag',
  'heart.fill': 'favorite',
  'magnifyingglass': 'search',
  'bell': 'notifications',
  'bell.fill': 'notifications-active',
  'chart.bar.fill': 'bar-chart',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'arrow.up': 'keyboard-arrow-up',
  'paintpalette': 'palette',
  'leaf': 'eco',
  'star.fill': 'star',
  'crown.fill': 'emoji-events',
  'camera.fill': 'camera-alt',
  'dollarsign': 'attach-money',
  'person.text.rectangle': 'contact-page',
  'calendar': 'event',
  'briefcase.fill': 'work',
  'creditcard': 'credit-card',
  'arrow.down': 'keyboard-arrow-down',
  'minus': 'remove',
  'list.bullet.rectangle.fill': 'format-list-bulleted',
  'plus.circle.fill': 'add-circle',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'envelope.fill': 'mail',
  'location': 'place',
  'clock': 'access-time',
  'checkmark.circle': 'check-circle',
  'paperplane': 'send',
  'eye.fill': 'visibility',
  'trash.fill': 'delete',
  'ruler': 'square-foot',
  'scalemass': 'monitor-weight',
  'person.circle': 'account-circle',
  'figure.walk': 'directions-walk',
  'figure.dress.line.vertical.figure': 'checkroom',
  'shoe.fill': 'directions-run',
  'jacket.fill': 'checkroom',
  'tag.fill': 'local-offer',
  'exclamationmark.circle.fill': 'error',
  'sparkles': 'auto-awesome',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
