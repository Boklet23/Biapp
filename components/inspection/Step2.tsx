import { Switch, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FrameCounter } from './FrameCounter';
import { sharedStyles } from './inspectionStyles';

export interface Step2Props {
  framesbrood: number;
  setFramesBrood: (v: number) => void;
  framesHoney: number;
  setFramesHoney: (v: number) => void;
  framesEmpty: number;
  setFramesEmpty: (v: number) => void;
  queenSeen: boolean;
  setQueenSeen: (v: boolean) => void;
  queenCells: boolean;
  setQueenCells: (v: boolean) => void;
}

export function Step2({
  framesbrood, setFramesBrood,
  framesHoney, setFramesHoney,
  framesEmpty, setFramesEmpty,
  queenSeen, setQueenSeen,
  queenCells, setQueenCells,
}: Step2Props) {
  return (
    <View style={sharedStyles.stepContent}>
      <Text style={sharedStyles.stepHeading}>Kubestatus</Text>

      <FrameCounter label="Yngelrammer" value={framesbrood} onChange={setFramesBrood} />
      <FrameCounter label="Honningrammer" value={framesHoney} onChange={setFramesHoney} />
      <FrameCounter label="Tomme rammer" value={framesEmpty} onChange={setFramesEmpty} />

      <View style={sharedStyles.toggleRow}>
        <Text style={sharedStyles.toggleLabel}>Dronning sett</Text>
        <Switch
          value={queenSeen}
          onValueChange={setQueenSeen}
          trackColor={{ true: Colors.honey }}
          thumbColor={Colors.white}
        />
      </View>

      <View style={sharedStyles.toggleRow}>
        <Text style={sharedStyles.toggleLabel}>Dronningceller funnet</Text>
        <Switch
          value={queenCells}
          onValueChange={setQueenCells}
          trackColor={{ true: Colors.warning }}
          thumbColor={Colors.white}
        />
      </View>
    </View>
  );
}
