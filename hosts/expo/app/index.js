// Root route redirect - sends / to /main (the launcher)
import { Redirect } from 'expo-router';

export default function IndexRedirect () {
  return <Redirect href="/main" />;
}
