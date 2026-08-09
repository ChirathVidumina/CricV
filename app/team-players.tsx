import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TeamPlayersScreen from '../src/TeamPlayersScreen';

export default function TeamPlayersRoute(props: any) {
  const params = useLocalSearchParams<{ teamName?: string; teamId?: string }>();
  const router = useRouter();

  const teamName = props?.route?.params?.teamName || params?.teamName || 'Team Players';
  const teamId = props?.route?.params?.teamId || params?.teamId || '';

  return (
    <TeamPlayersScreen
      teamName={teamName}
      teamId={teamId}
      onBack={() => {
        if (router && typeof router.back === 'function') {
          router.back();
        } else if (props?.navigation?.goBack) {
          props.navigation.goBack();
        }
      }}
    />
  );
}
