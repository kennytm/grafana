import * as fs from 'fs';
import darkTheme from '@grafana/ui';
import lightTheme from '@grafana/ui';
import defaultTheme from '@grafana/ui';
import { darkThemeVarsTemplate } from '@grafana/ui';
import { lightThemeVarsTemplate } from '@grafana/ui';
import { commonThemeVarsTemplate } from '@grafana/ui';

const darkThemeVariablesPath = __dirname + '/../../public/sass/_variables.dark.generated.scss';
const lightThemeVariablesPath = __dirname + '/../../public/sass/_variables.light.generated.scss';
const defaultThemeVariablesPath = __dirname + '/../../public/sass/_variables.generated.scss';

const writeVariablesFile = async (path: string, data: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, e => {
      if (e) {
        reject(e);
      } else {
        resolve(data);
      }
    });
  });
};

const generateSassVariableFiles = async () => {
  try {
    await Promise.all([
      writeVariablesFile(darkThemeVariablesPath, darkThemeVarsTemplate(darkTheme)),
      writeVariablesFile(lightThemeVariablesPath, lightThemeVarsTemplate(lightTheme)),
      writeVariablesFile(defaultThemeVariablesPath, commonThemeVarsTemplate(defaultTheme)),
    ]);
    console.log('\nSASS variable files generated');
  } catch (error) {
    console.error('\nWriting SASS variable files failed', error);
    process.exit(1);
  }
};

generateSassVariableFiles();
