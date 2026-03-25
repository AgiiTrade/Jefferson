#!/usr/bin/env python3
"""
YouTube Kids Content Automation Pipeline
Generates nursery rhyme content daily using AI services
"""

import json
import os
from datetime import datetime, timedelta

# Content calendar - 30 days of nursery rhymes
CONTENT_CALENDAR = [
    {"day": 1, "title": "Twinkle Twinkle Little Star", "category": "lullaby", "keywords": ["nursery rhyme", "lullaby", "stars", "sleep"]},
    {"day": 2, "title": "ABC Phonics Song", "category": "educational", "keywords": ["alphabet", "abc", "learning", "phonics"]},
    {"day": 3, "title": "Old MacDonald Had a Farm", "category": "animals", "keywords": ["farm", "animals", "cow", "pig"]},
    {"day": 4, "title": "If You're Happy and You Know It", "category": "action", "keywords": ["happy", "clap", "action", "dance"]},
    {"day": 5, "title": "Wheels on the Bus", "category": "classic", "keywords": ["bus", "wheels", "kids", "sing along"]},
    {"day": 6, "title": "Row Row Row Your Boat", "category": "classic", "keywords": ["boat", "row", "water", "sing"]},
    {"day": 7, "title": "Five Little Monkeys", "category": "counting", "keywords": ["monkeys", "counting", "numbers", "jumping"]},
    {"day": 8, "title": "Head Shoulders Knees and Toes", "category": "body", "keywords": ["body parts", "dance", "exercise", "kids"]},
    {"day": 9, "title": "Baa Baa Black Sheep", "category": "classic", "keywords": ["sheep", "wool", "farm", "nursery"]},
    {"day": 10, "title": "Itsy Bitsy Spider", "category": "classic", "keywords": ["spider", "rain", "sun", "nursery"]},
    {"day": 11, "title": "Baby Shark", "category": "animals", "keywords": ["shark", "ocean", "baby", "doo doo"]},
    {"day": 12, "title": "Rain Rain Go Away", "category": "weather", "keywords": ["rain", "weather", "sun", "play"]},
    {"day": 13, "title": "Mary Had a Little Lamb", "category": "animals", "keywords": ["lamb", "sheep", "school", "white"]},
    {"day": 14, "title": "Hokey Pokey", "category": "dance", "keywords": ["dance", "hokey pokey", "body", "move"]},
    {"day": 15, "title": "B-I-N-G-O", "category": "spelling", "keywords": ["bingo", "dog", "spelling", "farm"]},
    {"day": 16, "title": "London Bridge", "category": "classic", "keywords": ["london", "bridge", "building", "classic"]},
    {"day": 17, "title": "Humpty Dumpty", "category": "story", "keywords": ["egg", "wall", "fall", "story"]},
    {"day": 18, "title": "Jack and Jill", "category": "story", "keywords": ["hill", "water", "pail", "story"]},
    {"day": 19, "title": "Pat-a-Cake", "category": "action", "keywords": ["baker", "cake", "clap", "baby"]},
    {"day": 20, "title": "This Old Man", "category": "counting", "keywords": ["counting", "old man", "knick knack", "numbers"]},
    {"day": 21, "title": "Pop Goes the Weasel", "category": "dance", "keywords": ["weasel", "pop", "dance", "music"]},
    {"day": 22, "title": "Yankee Doodle", "category": "patriotic", "keywords": ["yankee", "doodle", "patriotic", "fun"]},
    {"day": 23, "title": "She'll Be Coming Round the Mountain", "category": "classic", "keywords": ["mountain", "coming", "classic", "sing"]},
    {"day": 24, "title": "Ten Little Indians", "category": "counting", "keywords": ["counting", "ten", "numbers", "indians"]},
    {"day": 25, "title": "Rock-a-Bye Baby", "category": "lullaby", "keywords": ["baby", "lullaby", "sleep", "tree"]},
    {"day": 26, "title": "Hey Diddle Diddle", "category": "fantasy", "keywords": ["cat", "fiddle", "cow", "moon"]},
    {"day": 27, "title": "Little Miss Muffet", "category": "story", "keywords": ["spider", "tuffet", "curds", "whey"]},
    {"day": 28, "title": "Hickory Dickory Dock", "category": "clock", "keywords": ["clock", "mouse", "time", "numbers"]},
    {"day": 29, "title": "Three Blind Mice", "category": "classic", "keywords": ["mice", "farmer", "classic", "round"]},
    {"day": 30, "title": "We're Going to the Zoo", "category": "animals", "keywords": ["zoo", "animals", "trip", "fun"]},
]

# Suno AI prompts for each category
SUNO_PROMPTS = {
    "lullaby": "Gentle children's lullaby, soft piano and flute, female voice, 70-80 BPM, C major, soothing bedtime melody",
    "educational": "Upbeat educational kids song, xylophone and ukulele, kids choir, 110-120 BPM, C major, catchy learning melody",
    "animals": "Fun farm animal song, banjo and acoustic guitar, kids voice, 100-110 BPM, G major, playful animal sounds",
    "action": "Energetic kids action song, drums and tambourine, 120-130 BPM, C major, dance-along rhythm",
    "classic": "Classic nursery rhyme arrangement, accordion and piano, 90-100 BPM, F major, sing-along melody",
    "counting": "Counting song for kids, marimba and xylophone, 100-110 BPM, C major, numbers learning melody",
    "body": "Body parts learning song, drums and clapping, 110-120 BPM, C major, exercise dance rhythm",
    "weather": "Weather song for kids, ukulele and flute, 90-100 BPM, G major, gentle outdoor melody",
    "dance": "Fun dance song for kids, trumpet and drums, 120-130 BPM, C major, party dance rhythm",
    "spelling": "Spelling song for kids, piano and bells, 90-100 BPM, C major, letter learning melody",
    "story": "Story nursery rhyme, gentle piano, 80-90 BPM, F major, storytelling melody",
    "patriotic": "Patriotic kids song, marching band, 100-110 BPM, C major, proud marching rhythm",
    "fantasy": "Fantasy nursery rhyme, harp and flute, 80-90 BPM, D major, magical whimsical melody",
    "clock": "Clock and time song, marimba and bells, 100-110 BPM, C major, ticking rhythm",
}

def generate_metadata(content):
    """Generate YouTube metadata for a video"""
    return {
        "title": f"{content['title']} | Nursery Rhymes for Kids | Little Star Songs",
        "description": f"""🎵 {content['title']} - Nursery Rhymes for Kids!

Sing along with this fun and educational nursery rhyme! Perfect for babies, toddlers, and preschoolers.

✨ What's Inside:
• Catchy melody kids will love
• Colorful animated characters
• Educational and entertaining
• Safe for all ages

🎯 Perfect For:
• Babies and toddlers
• Preschool learning
• Kindergarten activities
• Screen-time entertainment

🔔 SUBSCRIBE for new nursery rhymes every day!
👍 LIKE if your child enjoyed this video!
💬 COMMENT which song you want next!

#nurseryrhymes #kidssongs #childrensmusic #{' #'.join(content['keywords'])}

© Little Star Songs {datetime.now().year}""",
        "tags": ["nursery rhymes", "kids songs", "children music", "baby songs", 
                 "toddler songs", "preschool", "learning songs", "abc song", 
                 "counting songs", "lullaby"] + content['keywords'],
        "category_id": "27",  # Education
        "default_language": "en",
        "made_for_kids": True
    }

def generate_suno_prompt(content):
    """Generate Suno AI music prompt"""
    return {
        "style": SUNO_PROMPTS[content['category']],
        "lyrics": f"[Verse]\n{content['title']}\n[Instrumental]",
        "title": content['title'],
        "model": "v3.5"
    }

def generate_daily_plan(date_str):
    """Generate plan for a specific day"""
    day_num = (int(date_str.split('-')[-1]) % 30) + 1
    content = CONTENT_CALENDAR[day_num - 1]
    
    return {
        "date": date_str,
        "content": content,
        "metadata": generate_metadata(content),
        "suno_prompt": generate_suno_prompt(content),
        "steps": [
            {"step": 1, "action": "Generate lyrics", "tool": "ChatGPT/Claude", "status": "pending"},
            {"step": 2, "action": "Generate music", "tool": "Suno AI", "status": "pending"},
            {"step": 3, "action": "Generate animation", "tool": "Runway/Pika", "status": "pending"},
            {"step": 4, "action": "Combine audio+video", "tool": "DaVinci Resolve", "status": "pending"},
            {"step": 5, "action": "Upload to YouTube", "tool": "YouTube API", "status": "pending"},
        ]
    }

def save_daily_plan(plan, output_dir):
    """Save daily plan to file"""
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{plan['date']}-plan.json"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w') as f:
        json.dump(plan, f, indent=2)
    
    print(f"✅ Saved plan: {filepath}")
    return filepath

if __name__ == "__main__":
    print("🎵 YouTube Kids Content Automation")
    print("=" * 50)
    
    # Generate plans for next 30 days
    output_dir = "/Users/assistant/.openclaw/workspace/active/youtube-plans"
    
    for i in range(30):
        date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        plan = generate_daily_plan(date)
        save_daily_plan(plan, output_dir)
    
    print(f"\n✅ Generated 30 daily plans in {output_dir}")
    print("\n📋 Next steps:")
    print("1. Review daily plans")
    print("2. Copy Suno prompts to generate music")
    print("3. Use metadata for YouTube uploads")
    print("4. Run this script daily for new content")
