# Debug Guide for Voice Chat Issues

## בדיקות לביצוע:

### 1. בדיקת תמיכת דפדפן
- פתח את Console בדפדפן (F12)
- הקלד:
```javascript
console.log('Speech Recognition:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
console.log('Speech Synthesis:', 'speechSynthesis' in window);
```

### 2. בדיקת הרשאות מיקרופון
- בדוק שיש אייקון מיקרופון בשורת הכתובת
- ודא שההרשאה ניתנה לאתר

### 3. בדיקת קולות זמינים
- הקלד ב-Console:
```javascript
speechSynthesis.getVoices().forEach(v => console.log(v.name, v.lang));
```

### 4. בדיקת מיקרופון
- הקלד ב-Console:
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone works!');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('Microphone error:', err));
```

## פתרונות נפוצים:

1. **אין זיהוי קול**:
   - השתמש ב-Chrome או Edge (לא Firefox)
   - ודא חיבור HTTPS או localhost
   - בדוק הרשאות מיקרופון

2. **אין דיבור**:
   - רענן את הדף
   - בדוק עוצמת קול במערכת
   - נסה דפדפן אחר

3. **עברית לא עובדת**:
   - ודא שיש קולות עבריים מותקנים במערכת
   - ב-Windows: הגדרות > זמן ושפה > דיבור
   - ב-Mac: העדפות מערכת > נגישות > תוכן מדובר 