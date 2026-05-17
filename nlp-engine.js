/**
 * CrisisGuard AI — NLP Crisis Detection Engine v2
 * Now with single-word detection, violence detection, and contextual advice generation
 */
const CrisisNLP = (() => {
    // ═══ CRISIS LEXICON — Phrases + Single Words ═══
    const CRISIS_LEXICON = {
        suicidal_ideation: {
            weight: 1.0, label: 'Suicidal Ideation', color: '#ef4444',
            phrases: ['kill myself','end my life','want to die','better off dead','no reason to live','take my own life','end it all','not worth living','jump off','hang myself','shoot myself','goodbye forever','final goodbye','last letter','suicide note','no way out','only option left','done with life','planning to end','painless way to die','want to end it','slit my wrist'],
            words: ['suicide','suicidal','overdose']
        },
        violence: {
            weight: 0.9, label: 'Violence / Harm to Others', color: '#dc2626',
            phrases: ['kill someone','want to kill','going to kill','hurt someone','harm someone','beat someone','stab someone','shoot someone','murder','violent thoughts','feel like hurting','make them pay','destroy them','revenge','get a weapon','bring a gun'],
            words: ['kill','murder','weapon','stab','strangle','assault','revenge','homicidal']
        },
        self_harm: {
            weight: 0.85, label: 'Self-Harm Indicators', color: '#f97316',
            phrases: ['cut myself','cutting myself','self harm','self-harm','hurt myself','burn myself','punish myself','scratch myself','hit myself','bang my head','starve myself','deserve pain','need to feel pain','hiding scars','long sleeves to hide'],
            words: ['cutting','purging','purge','blade','razor','scars','self-harm','selfharm']
        },
        severe_distress: {
            weight: 0.7, label: 'Severe Emotional Distress', color: '#f59e0b',
            phrases: ["can't take it anymore",'breaking down','falling apart','mental breakdown','losing my mind',"can't breathe",'panic attack','anxiety attack','everything hurts',"can't stop crying",'screaming inside','unbearable pain','emotional agony',"can't escape",'darkness consuming','nothing helps','getting worse','spiraling','rock bottom','at my limit','breaking point','want to scream','losing control','going crazy'],
            words: ['agony','anguish','tormented','tortured','devastated','shattered','overwhelmed','suffocating','drowning','unbearable']
        },
        hopelessness: {
            weight: 0.65, label: 'Hopelessness & Despair', color: '#a855f7',
            phrases: ['no hope','nothing will change','never get better','given up','why bother',"what's the point",'no purpose','empty inside','nothing matters','no one cares','alone in this','burden to everyone','world is better without me','nobody would notice',"don't belong",'ruined everything','complete failure','no future','no point in trying','life is meaningless'],
            words: ['hopeless','pointless','meaningless','worthless','useless','numb','void','failure','burden','invisible','abandoned','unwanted']
        },
        isolation: {
            weight: 0.5, label: 'Social Isolation', color: '#6366f1',
            phrases: ['all alone','no friends','nobody understands','pushing everyone away','no one to talk to','shut everyone out','no support system',"don't fit in",'rejected by everyone'],
            words: ['isolated','disconnected','withdrawn','lonely','loneliness','alienated','outcast','estranged','rejected']
        },
        substance: {
            weight: 0.6, label: 'Substance Crisis', color: '#ec4899',
            phrases: ['drinking to forget','drunk again','relapsed','using again','need a fix',"can't stop drinking",'mixing pills','high all the time','drinking every night'],
            words: ['relapsing','withdrawal','blackout','overdose','addicted','dependency','alcoholic','drunk','wasted']
        },
        depression: {
            weight: 0.55, label: 'Depression Indicators', color: '#8b5cf6',
            phrases: ['so depressed','deeply depressed','clinical depression','been depressed','feeling depressed','major depression','depression is killing','chronic depression'],
            words: ['depressed','depression','melancholy','despondent','miserable','bleak','gloomy','dejected','desolate']
        },
        anxiety: {
            weight: 0.45, label: 'Anxiety / Fear', color: '#06b6d4',
            phrases: ['constant anxiety','crippling anxiety','anxiety disorder','fear of everything','scared all the time','paranoid thoughts','intrusive thoughts','obsessive thoughts'],
            words: ['anxious','anxiety','terrified','panicking','paranoid','phobia','dread','fearful','hyperventilating']
        }
    };

    const INTENSIFIERS = ['really','very','extremely','absolutely','completely','totally','utterly','truly','genuinely','seriously','desperately','so much','so badly','more than ever','always','constantly','every day','every night','forever'];
    const TEMPORAL_URGENCY = ['right now','tonight','today','this moment','immediately','about to','going to','planning to','decided to','ready to','final','last time','one last','before I go'];
    const PROTECTIVE = ['but I have','my kids','my family','getting help','therapist','counselor','medication','treatment','recovering','getting better','hope','looking forward','grateful','thankful','support group','reaching out','asking for help','want to live'];

    function tokenize(text) {
        return text.toLowerCase().replace(/[^\w\s'-]/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(t=>t.length>0);
    }

    function detectCrisisTerms(text) {
        const norm = text.toLowerCase();
        const tokens = tokenize(text);
        const detections = [];
        const seen = new Set();

        for (const [category, data] of Object.entries(CRISIS_LEXICON)) {
            // Phrase matching
            if (data.phrases) {
                for (const term of data.phrases) {
                    if (norm.includes(term) && !seen.has(category+':'+term)) {
                        seen.add(category+':'+term);
                        detections.push({ category, term, count: 1, weight: data.weight, label: data.label, color: data.color });
                    }
                }
            }
            // Single word matching
            if (data.words) {
                for (const word of data.words) {
                    if (tokens.includes(word) && !seen.has(category+':'+word)) {
                        seen.add(category+':'+word);
                        detections.push({ category, term: word, count: 1, weight: data.weight * 0.8, label: data.label, color: data.color });
                    }
                }
            }
        }
        return detections;
    }

    function analyzeSentiment(text) {
        const norm = text.toLowerCase();
        const tokens = tokenize(text);
        const negWords = ['hate','angry','sad','depressed','anxious','afraid','scared','terrified','miserable','devastated','heartbroken','destroyed','shattered','crushed','broken','damaged','ruined','horrible','terrible','awful','dreadful','painful','agonizing','suffering','tormented','tortured','anguish','despair','grief','sorrow','regret','guilt','shame','disgust','rage','fury','bitter','resentful','frustrated','exhausted','overwhelmed','stressed','burnout','tired','drained','weak','sick','dying','dead','ugly','stupid','pathetic','loser','disgusting','trash','garbage','toxic','poison','evil','dark','darkness','nightmare','hell','demon','monster','worthless','useless','meaningless','pointless'];
        const posWords = ['happy','joy','love','hope','excited','grateful','thankful','blessed','wonderful','amazing','great','good','better','improving','healing','recovering','strong','confident','peaceful','calm','relaxed','content','satisfied','proud','accomplished','motivated','inspired','optimistic','cheerful'];

        let neg=0,pos=0;
        tokens.forEach(t=>{ if(negWords.includes(t))neg++; if(posWords.includes(t))pos++; });

        let intensifiers=0,urgency=0,protective=0;
        INTENSIFIERS.forEach(i=>{ if(norm.includes(i))intensifiers++; });
        TEMPORAL_URGENCY.forEach(t=>{ if(norm.includes(t))urgency++; });
        PROTECTIVE.forEach(t=>{ if(norm.includes(t))protective++; });

        const total = Math.max(tokens.length,1);
        const raw = (pos-neg)/total;
        return { negative:neg, positive:pos, intensifiers, urgency, protectiveFactors:protective, rawScore:raw, normalizedScore:Math.max(-1,Math.min(1,raw*3)) };
    }

    function calculateSeverity(detections, sentiment) {
        if (detections.length===0 && sentiment.negative<2) return { score:0, level:'none', label:'No Crisis Detected', color:'#10b981' };

        let base=0;
        const catScores={};
        detections.forEach(d=>{ const s=d.weight*d.count; base+=s; catScores[d.category]=(catScores[d.category]||0)+s; });

        const sentMod = Math.max(0,-sentiment.normalizedScore)*15;
        const urgMod = sentiment.urgency*12;
        const intMod = sentiment.intensifiers*5;
        const proMod = sentiment.protectiveFactors*-8;
        const cats = Object.keys(catScores).length;
        const multiMod = cats>1?(cats-1)*10:0;
        // Even without phrase matches, high negative sentiment = some concern
        const sentOnly = detections.length===0 && sentiment.negative>=2 ? sentiment.negative*8 : 0;

        let raw = base*18 + sentMod + urgMod + intMod + proMod + multiMod + sentOnly;
        raw = Math.max(0,Math.min(100,raw));

        let level,label,color;
        if(raw>=75){level='critical';label='CRITICAL — Immediate Intervention Required';color='#ef4444';}
        else if(raw>=50){level='high';label='HIGH — Urgent Attention Needed';color='#f97316';}
        else if(raw>=25){level='moderate';label='MODERATE — Monitor Closely';color='#f59e0b';}
        else if(raw>0){level='low';label='LOW — Mild Concern Detected';color='#6366f1';}
        else{level='none';label='No Crisis Detected';color='#10b981';}

        return { score:Math.round(raw), level, label, color, breakdown:{baseScore:Math.round(base*18),sentimentMod:Math.round(sentMod),urgencyMod:Math.round(urgMod),intensifierMod:Math.round(intMod),protectiveMod:Math.round(proMod),multiCatMod:Math.round(multiMod),categoryCount:cats} };
    }

    function getActions(severity) {
        const a={
            critical:[{icon:'🚨',text:'IMMEDIATELY contact emergency services (911/988)',priority:'critical'},{icon:'📞',text:'Initiate direct outreach to the individual',priority:'critical'},{icon:'👥',text:'Alert on-call crisis intervention team',priority:'critical'},{icon:'📋',text:'Document all interactions per protocol',priority:'high'},{icon:'🔄',text:'Begin continuous monitoring mode',priority:'high'}],
            high:[{icon:'📞',text:'Reach out within 1 hour for wellness check',priority:'high'},{icon:'🧑‍⚕️',text:'Connect with licensed mental health professional',priority:'high'},{icon:'📊',text:'Escalate to supervisory review',priority:'medium'},{icon:'🔔',text:'Set up alert monitoring for follow-up',priority:'medium'}],
            moderate:[{icon:'💬',text:'Schedule a supportive check-in conversation',priority:'medium'},{icon:'📚',text:'Share relevant mental health resources',priority:'medium'},{icon:'📊',text:'Add to monitoring watchlist',priority:'low'}],
            low:[{icon:'👀',text:'Continue routine monitoring',priority:'low'},{icon:'📚',text:'Make wellness resources available',priority:'low'}],
            none:[{icon:'✅',text:'No immediate action required',priority:'info'}]
        };
        return a[severity.level]||a.none;
    }

    // ═══ CONTEXTUAL AI ADVICE GENERATOR ═══
    function generateContextualAdvice(text, detections, severity, sentiment) {
        const norm = text.toLowerCase();
        const cats = new Set(detections.map(d=>d.category));
        const advice = [];

        // Violence-specific
        if(cats.has('violence')){
            advice.push({icon:'⚠️',title:'Violence Risk Detected',text:'This text contains indicators of potential harm to others. If this is a real situation, contact law enforcement immediately. Consider whether this person has access to weapons or has a history of violent behavior. Safety planning should be the first priority.',type:'danger'});
            if(norm.includes('kill')||norm.includes('murder'))advice.push({icon:'🔒',title:'Safety Assessment Needed',text:'Language suggesting intent to harm others requires immediate risk assessment. Determine if there is a specific target, a plan, and means to carry it out. Document everything for professional evaluation.',type:'danger'});
        }
        // Suicidal ideation
        if(cats.has('suicidal_ideation')){
            advice.push({icon:'💛',title:'Suicidal Ideation Response',text:'This text shows signs of suicidal thinking. Apply the QPR method: Question directly about suicide, Persuade to seek help, Refer to professional resources. Do NOT leave the person alone. Call 988 Suicide & Crisis Lifeline immediately.',type:'danger'});
            if(sentiment.urgency>0)advice.push({icon:'⏰',title:'Temporal Urgency Detected',text:'The language suggests imminent risk with time-specific references. This elevates the crisis level significantly. Emergency services should be contacted without delay.',type:'danger'});
        }
        // Self-harm
        if(cats.has('self_harm')){
            advice.push({icon:'🩹',title:'Self-Harm Support',text:'Self-harm is often a coping mechanism for emotional pain. Approach with empathy, not judgment. Help identify alternative coping strategies: holding ice cubes, drawing on skin with red marker, intense exercise, or calling a crisis line. Professional assessment is recommended.',type:'warning'});
        }
        // Depression
        if(cats.has('depression')){
            advice.push({icon:'🌧️',title:'Depression Indicators',text:'This person appears to be experiencing depressive symptoms. Validate their feelings without minimizing. Encourage professional evaluation — depression is highly treatable with therapy, medication, or both. Check in regularly as social support is critical.',type:'info'});
        }
        // Hopelessness
        if(cats.has('hopelessness')){
            advice.push({icon:'🌅',title:'Addressing Hopelessness',text:'Hopelessness is one of the strongest predictors of suicide risk. Help the person identify small, concrete reasons to keep going. Cognitive Behavioral Therapy (CBT) is highly effective for challenging hopeless thinking patterns. Even naming one future event to look forward to can help.',type:'warning'});
        }
        // Isolation
        if(cats.has('isolation')){
            advice.push({icon:'🤝',title:'Combating Isolation',text:'Social isolation amplifies mental health crises. Help build micro-connections: a text to an old friend, joining an online community, peer support groups. Even brief social interactions release oxytocin and reduce cortisol. Suggest warm lines (non-crisis emotional support phone lines).',type:'info'});
        }
        // Substance
        if(cats.has('substance')){
            advice.push({icon:'🏥',title:'Substance-Related Crisis',text:'Substance use combined with emotional distress significantly increases risk. SAMHSA Helpline (1-800-662-4357) provides free referrals 24/7. Avoid confrontational approaches — motivational interviewing is more effective. Ensure physical safety first.',type:'warning'});
        }
        // Anxiety
        if(cats.has('anxiety')){
            advice.push({icon:'🫁',title:'Anxiety Management',text:'Intense anxiety can feel life-threatening. Guide grounding techniques: 5-4-3-2-1 sensory exercise, box breathing (4 counts in, 4 hold, 4 out, 4 hold). Validate that their experience is real while helping them recognize that the acute phase will pass.',type:'info'});
        }
        // Severe distress
        if(cats.has('severe_distress')){
            advice.push({icon:'🌊',title:'Crisis De-escalation',text:'This person is in acute emotional distress. Use ALGEE: Assess risk, Listen non-judgmentally, Give reassurance, Encourage professional help, Encourage self-help strategies. Speak calmly, avoid minimizing their pain, and stay present.',type:'warning'});
        }
        // Multi-category concern
        if(cats.size>=3){
            advice.push({icon:'📊',title:'Multi-Factor Risk',text:`This text triggered ${cats.size} different risk categories simultaneously, indicating a complex crisis situation. Multi-factor presentations require coordinated professional intervention — a single support strategy is unlikely to be sufficient.`,type:'danger'});
        }
        // High negative sentiment without specific keywords
        if(sentiment.negative>=3 && detections.length===0){
            advice.push({icon:'💭',title:'Emotional Distress Detected',text:'While no specific crisis keywords were found, the overall emotional tone is significantly negative. This person may be struggling but not yet using crisis language. Proactive outreach and empathetic check-ins are recommended.',type:'info'});
        }
        // Protective factors found
        if(sentiment.protectiveFactors>0){
            advice.push({icon:'🛡️',title:'Protective Factors Present',text:'Positive signs were detected alongside concerning content. This person has anchors — family, hope, or help-seeking behavior. Reinforce these protective factors. They significantly reduce risk and indicate resilience.',type:'positive'});
        }
        // If nothing detected
        if(advice.length===0){
            advice.push({icon:'✅',title:'No Immediate Concern',text:'This text does not contain identifiable crisis indicators. However, context matters — if you have concerns about the author, trust your instincts and check in with them directly.',type:'positive'});
        }
        return advice;
    }

    function generateConfidence(detections, sentiment, text) {
        const tokens = tokenize(text).length;
        const lengthConf = Math.min(1,tokens/50)*100;
        const cats = new Set(detections.map(d=>d.category));
        const consistConf = Math.min(1,cats.size/3)*100;
        const alignConf = detections.length>0?(sentiment.negative>0?85+Math.min(15,sentiment.negative*3):50):(sentiment.negative>2?40:90);
        const overall = detections.length>0?Math.round(lengthConf*.2+consistConf*.3+alignConf*.5):Math.round(lengthConf*.5+50);
        return { overall:Math.min(98,overall), textLength:Math.round(lengthConf), consistency:Math.round(consistConf), alignment:Math.round(alignConf) };
    }

    function analyze(text) {
        const t0=performance.now();
        if(!text||text.trim().length===0) return {error:'No text provided'};
        const detections=detectCrisisTerms(text);
        const sentiment=analyzeSentiment(text);
        const severity=calculateSeverity(detections,sentiment);
        const actions=getActions(severity);
        const advice=generateContextualAdvice(text,detections,severity,sentiment);
        const confidence=generateConfidence(detections,sentiment,text);
        const catSummary={};
        detections.forEach(d=>{if(!catSummary[d.category])catSummary[d.category]={label:d.label,color:d.color,weight:d.weight,terms:[],totalHits:0};catSummary[d.category].terms.push(d.term);catSummary[d.category].totalHits+=d.count;});
        return {severity,sentiment,detections,categorySummary:catSummary,actions,advice,confidence,metadata:{analysisTime:Math.round(performance.now()-t0),textLength:text.length,tokenCount:tokenize(text).length,detectionCount:detections.length,timestamp:new Date().toISOString()}};
    }

    const SAMPLES = {
        low:"I've been feeling a bit down lately. Work has been stressful and I'm not sleeping well. I think I need to take a break and maybe talk to someone about managing my stress better. My friends have been supportive though.",
        medium:"I feel so overwhelmed and exhausted. Everything feels pointless and I can't stop crying. I'm isolated from everyone and the loneliness is crushing me. I don't know how much longer I can keep going like this. Nothing helps and I feel completely numb.",
        high:"I can't take it anymore. I'm so hopeless and alone. Nobody understands what I'm going through. I feel like a burden to everyone. The darkness is consuming me and I've been thinking about ending it all. I've been drinking to forget and I'm at my breaking point.",
        critical:"I've decided tonight is the night. I've written my final goodbye letter and I'm ready to end my life. I can't go on anymore. I've been planning this for weeks. I'm going to take all the pills. This is my suicide note."
    };

    return { analyze, SAMPLES, CRISIS_LEXICON };
})();
