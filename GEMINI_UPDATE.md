# עדכון AreoVizN AI - אינטגרציית Gemini AI

## מה חדש? 🎉

### 1. **ניתוח אנומליות עם AI**
- כשבוחרים אנומליה, המערכת מנתחת אותה עם Gemini AI
- ניתוח מעמיק כולל סיבות אפשריות והמלצות
- מותאם לתפקיד המשתמש (טייס/טכנאי/מנהל)

### 2. **צ'אט AI אינטראקטיבי**
- פאנל צ'אט חדש בצד ימין של הדשבורד
- יכולת לשאול שאלות על נתוני הטיסה
- זיכרון שיחה - ה-AI זוכר את ההיסטוריה
- שמירה מקומית של היסטוריית הצ'אט

### 3. **תמיכה בקול**
- כפתור מיקרופון לקלט קולי
- המרת טקסט לדיבור עבור תשובות AI
- עובד עם הדפדפן (Chrome/Edge מומלץ)

### 4. **פעולות מהירות**
- כפתורים לשאלות נפוצות
- יצירת דוחות אוטומטיים
- ניתוח בטיחות מיידי

## איך להתקין את העדכון

1. **עצור את השרת אם הוא רץ** (Ctrl+C)

2. **התקן את התלויות החדשות:**
   ```bash
   npm install @google/generative-ai
   ```

3. **הפעל מחדש את השרת:**
   ```bash
   npm run dev
   ```

## איך להשתמש

### ניתוח אנומליות עם AI
1. לחץ על אנומליה מהרשימה או מהגרף
2. בפאנל "AI Advisory" תראה ניתוח מפורט
3. לחץ על "View Role-Specific Guidelines" לקבלת הנחיות נוספות

### שימוש בצ'אט
1. הפאנל התחתון בצד ימין הוא הצ'אט
2. הקלד שאלה או השתמש בכפתורי הפעולה המהירה
3. לחץ Enter או על כפתור השליחה

### שימוש בקול
1. לחץ על כפתור המיקרופון
2. דבר בבירור (באנגלית)
3. הטקסט יופיע אוטומטית וישלח

### תכונות נוספות
- **ייצוא צ'אט**: כפתור הורדה בפינה העליונה
- **ניקוי היסטוריה**: כפתור פח האשפה
- **הקראת תשובות**: כפתור רמקול ליד כל תשובת AI

## דוגמאות לשאלות

- "Explain the current cabin pressure anomaly"
- "What are the safety implications?"
- "Generate a maintenance report"
- "Compare current values to normal operating range"
- "What similar incidents occurred in the past?"

## פתרון בעיות

### שגיאת AI
- ודא חיבור אינטרנט פעיל
- ה-API Key כבר מוגדר בקוד
- אם יש בעיה, בדוק את הקונסול

### קול לא עובד
- השתמש ב-Chrome או Edge
- אשר הרשאות מיקרופון
- ודא שהדפדפן תומך ב-Web Speech API

## הערות
- הצ'אט נשמר מקומית בדפדפן
- מחיקת היסטוריית הדפדפן תמחק גם את הצ'אט
- ה-AI מקבל את כל נתוני הטיסה הנוכחיים
