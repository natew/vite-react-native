type Theme = {
  accentBackground: string;
  accentColor: string;
  background0: string;
  background025: string;
  background05: string;
  background075: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  color6: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
  color11: string;
  color12: string;
  color13: string;
  color0: string;
  color025: string;
  color05: string;
  color075: string;
  color: string;
  background: string;
  borderColor: string;
  yellow1: string;
  yellow2: string;
  yellow3: string;
  yellow4: string;
  yellow5: string;
  yellow6: string;
  yellow7: string;
  yellow8: string;
  yellow9: string;
  yellow10: string;
  yellow11: string;
  yellow12: string;
  yellow13: string;
  gray1: string;
  gray2: string;
  gray3: string;
  gray4: string;
  gray5: string;
  gray6: string;
  gray7: string;
  gray8: string;
  gray9: string;
  gray10: string;
  gray11: string;
  gray12: string;
  blue: string;
  green: string;
  red: string;
  purple: string;
  pink: string;
  blueFg: string;
  greenFg: string;
  redFg: string;
  purpleFg: string;
  pinkFg: string;
  shadowColor: string;
  shadowColorStrong: string;

}

function t(a: [number, number][]) {
  let res: Record<string,string> = {}
  for (const [ki, vi] of a) {
    res[ks[ki] as string] = vs[vi] as string
  }
  return res as Theme
}
const vs = [
  'hsl(54, 49.4%, 72.1%)',
  'hsl(54, 20%, 20.3%)',
  'rgba(255,255,255,0)',
  'rgba(255,255,255,0.25)',
  'rgba(255,255,255,0.5)',
  'rgba(255,255,255,0.75)',
  '#D1CDC2',
  '#f8f8f8',
  'hsl(0, 0%, 96.3%)',
  'hsl(0, 0%, 94.1%)',
  'hsl(0, 0%, 92.0%)',
  'hsl(0, 0%, 90.0%)',
  'hsl(0, 0%, 88.5%)',
  'hsl(0, 0%, 81.0%)',
  'hsl(0, 0%, 56.1%)',
  'hsl(0, 0%, 50.3%)',
  'hsl(0, 0%, 42.5%)',
  'hsl(0, 0%, 9.0%)',
  '#000',
  'rgba(10,10,10,0)',
  'rgba(10,10,10,0.25)',
  'rgba(10,10,10,0.5)',
  'rgba(10,10,10,0.75)',
  'hsl(54, 24.0%, 95.5%)',
  'hsl(54, 30%, 93.5%)',
  'hsl(54, 40%, 88.9%)',
  'hsl(54, 40%, 83.6%)',
  'hsl(54, 47.9%, 78.0%)',
  'hsl(54, 50.4%, 65.0%)',
  'hsl(54, 90%, 62%)',
  'hsl(54, 80%, 58.0%)',
  'hsl(54, 50%, 40%)',
  'hsl(54, 40%, 30.0%)',
  'hsl(54, 35.0%, 15%)',
  'hsl(0, 0%, 99.0%)',
  'hsl(0, 0%, 97.3%)',
  'hsl(0, 0%, 95.1%)',
  'hsl(0, 0%, 93.0%)',
  'hsl(0, 0%, 90.9%)',
  'hsl(0, 0%, 88.7%)',
  'hsl(0, 0%, 85.8%)',
  'hsl(0, 0%, 78.0%)',
  'hsl(0, 0%, 52.3%)',
  'hsl(0, 0%, 43.5%)',
  'hsla(210, 60%, 80%)',
  'hsla(120, 60%, 80%)',
  'hsla(0, 60%, 80%)',
  'hsla(270, 60%, 80%)',
  'hsla(330, 60%, 80%)',
  'hsl(210, 60%, 10%)',
  'hsl(120, 60%, 10%)',
  'hsl(0, 60%, 10%)',
  'hsl(270, 60%, 10%)',
  'hsl(330, 60%, 10%)',
  'rgba(0,0,0,0.05)',
  'rgba(0,0,0,0.1)',
  '#050505',
  '#151515',
  '#191919',
  '#232323',
  '#282828',
  '#323232',
  '#424242',
  '#494949',
  '#545454',
  '#626262',
  '#a5a5a5',
  '#fff',
  'hsl(54, 10%, 10.5%)',
  'hsl(54, 10%, 12.7%)',
  'hsl(54, 10%, 14.7%)',
  'hsl(54, 20%, 16.4%)',
  'hsl(54, 20%, 18.1%)',
  'hsl(54, 30%, 22.4%)',
  'hsl(54, 60%, 25.0%)',
  'hsl(54, 92.0%, 40.0%)',
  'hsl(54, 100%, 60.0%)',
  'hsl(54, 80%, 80.0%)',
  'hsl(54, 50%, 91.0%)',
  'hsl(0, 0%, 8.5%)',
  'hsl(0, 0%, 11.0%)',
  'hsl(0, 0%, 13.6%)',
  'hsl(0, 0%, 15.8%)',
  'hsl(0, 0%, 17.9%)',
  'hsl(0, 0%, 20.5%)',
  'hsl(0, 0%, 24.3%)',
  'hsl(0, 0%, 31.2%)',
  'hsl(0, 0%, 43.9%)',
  'hsl(0, 0%, 49.4%)',
  'hsl(0, 0%, 62.8%)',
  'hsla(210, 60%, 40%, 1)',
  'hsla(120, 60%, 40%, 1)',
  'hsla(0, 60%, 40%, 1)',
  'hsla(270, 60%, 40%, 1)',
  'hsla(330, 60%, 40%, 1)',
  'hsl(210, 60%, 90%)',
  'hsl(120, 60%, 90%)',
  'hsl(0, 60%, 90%)',
  'hsl(270, 60%, 90%)',
  'hsl(330, 60%, 90%)',
  'rgba(0,0,0,0.12)',
  'rgba(0,0,0,0.2)',
  'hsla(0, 0%, 99.0%, 0)',
  'hsla(0, 0%, 99.0%, 0.25)',
  'hsla(0, 0%, 99.0%, 0.5)',
  'hsla(0, 0%, 99.0%, 0.75)',
  'hsla(0, 0%, 56.1%, 0.75)',
  'hsla(0, 0%, 56.1%, 0)',
  'hsla(0, 0%, 56.1%, 0.25)',
  'hsla(0, 0%, 56.1%, 0.5)',
  'hsla(54, 24.0%, 95.5%, 0)',
  'hsla(54, 24.0%, 95.5%, 0.25)',
  'hsla(54, 24.0%, 95.5%, 0.5)',
  'hsla(54, 24.0%, 95.5%, 0.75)',
  'hsla(54, 50%, 40%, 0)',
  'hsla(54, 50%, 40%, 0.25)',
  'hsla(54, 50%, 40%, 0.5)',
  'hsla(54, 50%, 40%, 0.75)',
  'hsla(0, 0%, 8.5%, 0)',
  'hsla(0, 0%, 8.5%, 0.125)',
  'hsla(0, 0%, 8.5%, 0.25)',
  'hsla(0, 0%, 8.5%, 0.375)',
  'hsla(0, 0%, 43.9%, 0.75)',
  'hsla(0, 0%, 43.9%, 0)',
  'hsla(0, 0%, 43.9%, 0.25)',
  'hsla(0, 0%, 43.9%, 0.5)',
  'hsla(54, 10%, 10.5%, 0)',
  'hsla(54, 10%, 10.5%, 0.125)',
  'hsla(54, 10%, 10.5%, 0.25)',
  'hsla(54, 10%, 10.5%, 0.375)',
  'hsla(54, 100%, 60.0%, 0)',
  'hsla(54, 100%, 60.0%, 0.25)',
  'hsla(54, 100%, 60.0%, 0.5)',
  'hsla(54, 100%, 60.0%, 0.75)',
  'hsl(54, 39.4%, 72.1%)',
  'hsl(54, 14.0%, 95.5%)',
  'hsl(54, 20%, 93.5%)',
  'hsl(54, 30%, 88.9%)',
  'hsl(54, 30%, 83.6%)',
  'hsl(54, 37.9%, 78.0%)',
  'hsl(54, 40.4%, 65.0%)',
  'hsla(54, 14.0%, 95.5%, 0)',
  'hsla(54, 14.0%, 95.5%, 0.25)',
  'hsla(54, 14.0%, 95.5%, 0.5)',
  'hsla(54, 14.0%, 95.5%, 0.75)',
]

const ks = [
'accentBackground',
'accentColor',
'background0',
'background025',
'background05',
'background075',
'color1',
'color2',
'color3',
'color4',
'color5',
'color6',
'color7',
'color8',
'color9',
'color10',
'color11',
'color12',
'color13',
'color0',
'color025',
'color05',
'color075',
'color',
'background',
'borderColor',
'yellow1',
'yellow2',
'yellow3',
'yellow4',
'yellow5',
'yellow6',
'yellow7',
'yellow8',
'yellow9',
'yellow10',
'yellow11',
'yellow12',
'yellow13',
'gray1',
'gray2',
'gray3',
'gray4',
'gray5',
'gray6',
'gray7',
'gray8',
'gray9',
'gray10',
'gray11',
'gray12',
'blue',
'green',
'red',
'purple',
'pink',
'blueFg',
'greenFg',
'redFg',
'purpleFg',
'pinkFg',
'shadowColor',
'shadowColorStrong']


const n1 = t([[0, 134],[1, 1],[2, 2],[3, 3],[4, 4],[5, 5],[6, 6],[7, 7],[8, 8],[9, 9],[10, 10],[11, 11],[12, 12],[13, 13],[14, 14],[15, 15],[16, 16],[17, 17],[18, 18],[19, 19],[20, 20],[21, 21],[22, 22],[23, 18],[24, 5],[25, 7],[26, 135],[27, 136],[28, 137],[29, 138],[30, 139],[31, 134],[32, 140],[33, 29],[34, 30],[35, 31],[36, 32],[37, 33],[38, 18],[39, 34],[40, 35],[41, 36],[42, 37],[43, 38],[44, 39],[45, 40],[46, 41],[47, 14],[48, 42],[49, 43],[50, 17],[51, 44],[52, 45],[53, 46],[54, 47],[55, 48],[56, 49],[57, 50],[58, 51],[59, 52],[60, 53],[61, 54],[62, 55]])

export const light = n1
const n2 = t([[0, 1],[1, 134],[2, 19],[3, 20],[4, 21],[5, 22],[6, 56],[7, 57],[8, 58],[9, 59],[10, 60],[11, 61],[12, 62],[13, 63],[14, 64],[15, 65],[16, 66],[17, 67],[18, 67],[19, 2],[20, 3],[21, 4],[22, 5],[23, 67],[24, 22],[25, 57],[26, 68],[27, 69],[28, 70],[29, 71],[30, 72],[31, 1],[32, 73],[33, 74],[34, 75],[35, 76],[36, 77],[37, 78],[38, 67],[39, 79],[40, 80],[41, 81],[42, 82],[43, 83],[44, 84],[45, 85],[46, 86],[47, 87],[48, 88],[49, 89],[50, 37],[51, 90],[52, 91],[53, 92],[54, 93],[55, 94],[56, 95],[57, 96],[58, 97],[59, 98],[60, 99],[61, 100],[62, 101]])

export const dark = n2
const n3 = t([[0, 135],[1, 18],[2, 102],[3, 103],[4, 104],[5, 105],[6, 34],[7, 35],[8, 36],[9, 37],[10, 38],[11, 39],[12, 40],[13, 41],[14, 14],[15, 42],[16, 43],[17, 17],[18, 106],[19, 107],[20, 108],[21, 109],[22, 106],[23, 106],[24, 105],[25, 35]])

export const light_gray = n3
const n4 = t([[0, 34],[1, 17],[2, 141],[3, 142],[4, 143],[5, 144],[6, 135],[7, 136],[8, 137],[9, 138],[10, 139],[11, 134],[12, 140],[13, 29],[14, 30],[15, 31],[16, 32],[17, 33],[18, 18],[19, 114],[20, 115],[21, 116],[22, 117],[23, 18],[24, 144],[25, 136]])

export const light_yellow = n4
const n5 = t([[0, 135],[1, 18],[2, 118],[3, 119],[4, 120],[5, 121],[6, 79],[7, 80],[8, 81],[9, 82],[10, 83],[11, 84],[12, 85],[13, 86],[14, 87],[15, 88],[16, 89],[17, 37],[18, 122],[19, 123],[20, 124],[21, 125],[22, 122],[23, 122],[24, 121],[25, 80]])

export const dark_gray = n5
const n6 = t([[0, 34],[1, 17],[2, 126],[3, 127],[4, 128],[5, 129],[6, 68],[7, 69],[8, 70],[9, 71],[10, 72],[11, 1],[12, 73],[13, 74],[14, 75],[15, 76],[16, 77],[17, 78],[18, 67],[19, 130],[20, 131],[21, 132],[22, 133],[23, 67],[24, 129],[25, 69]])

export const dark_yellow = n6