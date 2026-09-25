/** Namen van de demo-pagina's onder /dev (alleen in development). */
export const devDemos = [
  'cardstack',
  'featureswitches',
  'workflowcards',
  'exittoggle',
  'flipcards',
  'slotpicker',
  'appexplorer',
  'devicepreview',
  'billingtoggle',
  'accordion',
  'totalcalculator',
  'casetabs',
  'steptimeline',
  'intakewizard',
  'mobilemenu',
] as const;

export type DevDemo = (typeof devDemos)[number];
