import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { launchCalculatorApp } from '../utils/nativeLauncher';

export const CalculatorModal: React.FC = () => {
  const { activeModal, closeModal, theme, fontScale, vibrate } = useLauncher();

  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [historyText, setHistoryText] = useState('');

  if (activeModal !== 'calculator') return null;

  const handleDigit = (digit: string) => {
    vibrate('light');
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    vibrate('light');
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    vibrate('medium');
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setHistoryText('');
  };

  const handleBackspace = () => {
    vibrate('light');
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleToggleSign = () => {
    vibrate('light');
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(-val));
    }
  };

  const handlePercentage = () => {
    vibrate('light');
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(val / 100));
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleOperator = (nextOperator: string) => {
    vibrate('light');
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setHistoryText(`${inputValue} ${nextOperator}`);
    } else if (operator) {
      const result = calculate(prevValue, inputValue, operator);
      setPrevValue(result);
      setDisplay(String(Number(result.toFixed(6))));
      setHistoryText(`${Number(result.toFixed(6))} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    vibrate('success');
    const inputValue = parseFloat(display);

    if (operator && prevValue !== null) {
      const result = calculate(prevValue, inputValue, operator);
      setHistoryText(`${prevValue} ${operator} ${inputValue} =`);
      setDisplay(String(Number(result.toFixed(6))));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleTryNative = async () => {
    vibrate('medium');
    const opened = await launchCalculatorApp();
    if (opened) {
      closeModal();
    }
  };

  return (
    <Modal
      visible={activeModal === 'calculator'}
      transparent={false}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.headerBg }]}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.headerBg, borderColor: theme.cardBorder }]}>
            <View style={styles.headerTitleWrap}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: theme.textPrimary,
                    fontSize: fontScale.sectionTitle * 0.95,
                  },
                ]}
              >
                Calculator
              </Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.nativeBtn, { borderColor: theme.cardBorder }]}
                onPress={handleTryNative}
                activeOpacity={0.7}
              >
                <Ionicons name="open-outline" size={16} color={theme.accent} />
                <Text style={[styles.nativeBtnText, { color: theme.accent }]}>Phone App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={closeModal}
                activeOpacity={0.7}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Calculator Screen / Display */}
          <View style={[styles.screen, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {historyText.length > 0 && (
              <Text style={[styles.historyText, { color: theme.textSecondary }]} numberOfLines={1}>
                {historyText}
              </Text>
            )}
            <Text
              style={[styles.displayText, { color: theme.textPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {display}
            </Text>
          </View>

          {/* Keypad Grid */}
          <View style={styles.keypad}>
            {/* Row 1 */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, styles.clearBtn]}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>C</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={handleBackspace}
                activeOpacity={0.7}
              >
                <Ionicons name="backspace-outline" size={26} color={theme.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={handlePercentage}
                activeOpacity={0.7}
              >
                <Text style={[styles.btnText, { color: theme.textPrimary }]}>%</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.operatorBtn]}
                onPress={() => handleOperator('÷')}
                activeOpacity={0.7}
              >
                <Text style={styles.operatorBtnText}>÷</Text>
              </TouchableOpacity>
            </View>

            {/* Row 2 */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('7')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>7</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('8')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>8</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('9')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>9</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.operatorBtn]}
                onPress={() => handleOperator('×')}
                activeOpacity={0.7}
              >
                <Text style={styles.operatorBtnText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Row 3 */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('4')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>4</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('5')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>5</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('6')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>6</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.operatorBtn]}
                onPress={() => handleOperator('-')}
                activeOpacity={0.7}
              >
                <Text style={styles.operatorBtnText}>−</Text>
              </TouchableOpacity>
            </View>

            {/* Row 4 */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('1')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>1</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('2')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>2</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('3')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>3</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.operatorBtn]}
                onPress={() => handleOperator('+')}
                activeOpacity={0.7}
              >
                <Text style={styles.operatorBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Row 5 */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={handleToggleSign}
                activeOpacity={0.7}
              >
                <Text style={[styles.btnText, { color: theme.textPrimary }]}>±</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleDigit('0')}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>0</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={handleDecimal}
                activeOpacity={0.7}
              >
                <Text style={[styles.digitText, { color: theme.textPrimary }]}>.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.equalsBtn]}
                onPress={handleEquals}
                activeOpacity={0.7}
              >
                <Text style={styles.equalsBtnText}>=</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nativeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  nativeBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  screen: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 110,
  },
  historyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  displayText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  keypad: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 68,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  digitText: {
    fontSize: 28,
    fontWeight: '700',
  },
  btnText: {
    fontSize: 24,
    fontWeight: '700',
  },
  clearBtn: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  operatorBtn: {
    backgroundColor: '#EA580C',
    borderColor: '#C2410C',
  },
  operatorBtnText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 34,
  },
  equalsBtn: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },
  equalsBtnText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 36,
  },
});
